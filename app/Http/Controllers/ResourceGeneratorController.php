<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ResourceGeneratorController extends Controller
{
    public function index()
    {
        // Hanya bisa diakses saat local env atau oleh Super Admin
        // if (!app()->isLocal()) abort(403);
        
        return Inertia::render('dev/builder');
    }

    public function menus()
    {
        $dir = storage_path('app/builder/schemas');
        $schemas = [];
        
        if (File::exists($dir)) {
            $files = File::files($dir);
            foreach ($files as $file) {
                if ($file->getExtension() === 'json') {
                    $content = json_decode(File::get($file->getPathname()), true);
                    $content['_filename'] = $file->getFilename();
                    $schemas[] = $content;
                }
            }
        }
        
        return Inertia::render('dev/menus', [
            'schemas' => $schemas
        ]);
    }

    public function getSchemas()
    {
        $dir = storage_path('app/builder/schemas');
        $schemas = [];
        
        if (File::exists($dir)) {
            $files = File::files($dir);
            foreach ($files as $file) {
                if ($file->getExtension() === 'json') {
                    $content = json_decode(File::get($file->getPathname()), true);
                    $schemas[] = $content;
                }
            }
        }
        
        return response()->json($schemas);
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'resource_name' => 'required|string',
            'description' => 'nullable|string',
            'has_chart' => 'nullable|boolean',
            'has_summary' => 'nullable|boolean',
            'fields' => 'required|array',
            'fields.*.id' => 'required|string',
            'fields.*.name' => 'required|string',
            'fields.*.type' => 'required|string',
            'fields.*.related_model' => 'nullable|string',
        ]);

        $modelName = Str::studly(Str::singular($validated['resource_name'])); // ex: Barang
        $tableName = Str::snake(Str::plural($modelName)); // ex: barangs
        $routeName = Str::kebab(Str::plural($modelName)); // ex: barangs
        $folderName = Str::kebab($modelName); // ex: barang
        
        $fields = $validated['fields'];

        // 1. Generate Migration
        $this->generateMigration($tableName, $fields);
        
        // 2. Generate Model
        $this->generateModel($modelName, $fields);

        // 3. Generate Controller
        $this->generateController($modelName, $folderName, $routeName, $fields);

        $hasChart = $validated['has_chart'] ?? false;
        $hasSummary = $validated['has_summary'] ?? false;
        $description = $validated['description'] ?? '';

        // 4. Generate React Views (Index, Create, Edit)
        $this->generateReactViews($modelName, $folderName, $routeName, $fields, $hasChart, $hasSummary, $description);

        // 5. Append to Web Routes
        $this->appendRoute($modelName, $routeName);

        // 6. Tambahkan ke Menu Navigasi
        $this->appendNavigation($modelName, $routeName);

        // 7. Simpan Schema Builder
        $this->saveSchema($request->all(), $modelName);

        // 8. Jalankan Migrasi Otomatis
        Artisan::call('migrate');

        return redirect()->back()->with('success', "Resource $modelName berhasil di-generate secara ajaib dan sudah di-migrate! Cek file Anda.");
    }

    private function saveSchema($data, $modelName)
    {
        $dir = storage_path('app/builder/schemas');
        if (!File::exists($dir)) File::makeDirectory($dir, 0755, true);
        
        $fileName = Str::kebab($modelName) . '.json';
        File::put("{$dir}/{$fileName}", json_encode($data, JSON_PRETTY_PRINT));
    }

    private function generateMigration($tableName, $fields)
    {
        if (\Illuminate\Support\Facades\Schema::hasTable($tableName)) {
            $existingColumns = \Illuminate\Support\Facades\Schema::getColumnListing($tableName);
            $newFields = array_filter($fields, function($f) use ($existingColumns) {
                return !in_array(strtolower($f['name']), array_map('strtolower', $existingColumns));
            });
            
            if (count($newFields) > 0) {
                $schema = "";
                $dropSchema = "";
                foreach ($newFields as $field) {
                    $name = $field['name'];
                    $type = $field['type'];
                    if (strtolower($name) === 'id') continue;
                    
                    $actualType = $type === 'relation' ? 'unsignedBigInteger' : $type;
                    
                    // Add nullable so existing records don't crash
                    $schema .= "\n            \$table->{$actualType}('{$name}')->nullable();";
                    $dropSchema .= "\n            \$table->dropColumn('{$name}');";
                }
                
                $fileName = date('Y_m_d_His') . '_add_new_fields_to_' . $tableName . '_table.php';
                $template = "<?php\n\nuse Illuminate\Database\Migrations\Migration;\nuse Illuminate\Database\Schema\Blueprint;\nuse Illuminate\Support\Facades\Schema;\n\nreturn new class extends Migration\n{\n    public function up()\n    {\n        Schema::table('{$tableName}', function (Blueprint \$table) {{$schema}\n        });\n    }\n\n    public function down()\n    {\n        Schema::table('{$tableName}', function (Blueprint \$table) {{$dropSchema}\n        });\n    }\n};";
                
                File::put(database_path("migrations/{$fileName}"), $template);
            }
            return;
        }

        $className = 'Create' . str_replace(' ', '', ucwords(str_replace('_', ' ', $tableName))) . 'Table';
        $fileName = date('Y_m_d_His') . '_create_' . $tableName . '_table.php';
        
        $schema = "";
        foreach ($fields as $field) {
            $name = $field['name'];
            $type = $field['type'];
            
            // Skip kolom 'id' karena sudah dibuat otomatis oleh $table->id();
            if (strtolower($name) === 'id') {
                continue;
            }
            
            $actualType = $type === 'relation' ? 'unsignedBigInteger' : $type;
            
            $schema .= "\n            \$table->{$actualType}('{$name}');";
        }

        $template = "<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('{$tableName}', function (Blueprint \$table) {
            \$table->id();{$schema}
            \$table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('{$tableName}');
    }
};";

        File::put(database_path("migrations/{$fileName}"), $template);
    }

    private function generateModel($modelName, $fields)
    {
        $fillable = [];
        $relations = "";
        
        foreach ($fields as $f) {
            $name = Str::snake($f['name']);
            if (strtolower($name) !== 'id') {
                $fillable[] = "'" . $name . "'";
            }
            
            if ($f['type'] === 'relation' && !empty($f['related_model'])) {
                $relModelName = Str::studly(Str::singular($f['related_model']));
                $funcName = Str::camel(str_replace('_id', '', $name)); // e.g. user_id -> user
                
                $relations .= "\n    public function {$funcName}()\n    {\n        return \$this->belongsTo({$relModelName}::class, '{$name}');\n    }\n";
            }
        }
        
        $fillableStr = implode(', ', $fillable);

        $stub = "<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class {$modelName} extends Model
{
    use HasFactory;

    protected \$fillable = [{$fillableStr}];
{$relations}
}
";
        File::put(app_path("Models/{$modelName}.php"), $stub);
    }

    private function generateController($modelName, $folderName, $routeName, $fields)
    {
        $validations = "";
        $relations = [];
        $useStatements = ["use App\Models\\{$modelName};"];
        
        foreach ($fields as $f) {
            $name = Str::snake($f['name']);
            if (strtolower($name) !== 'id') {
                if ($f['type'] === 'relation' && !empty($f['related_model'])) {
                    $validations .= "            '{$name}' => 'nullable|exists:" . Str::snake(Str::plural(Str::studly(Str::singular($f['related_model'])))) . ",id',\n";
                    
                    $relModelName = Str::studly(Str::singular($f['related_model']));
                    $funcName = Str::camel(str_replace('_id', '', $name));
                    
                    $relations[] = [
                        'name' => $name, // e.g. kategori_id
                        'func' => $funcName, // e.g. kategori
                        'model' => $relModelName // e.g. Kategori
                    ];
                    
                    $useModel = "use App\Models\\{$relModelName};";
                    if (!in_array($useModel, $useStatements)) {
                        $useStatements[] = $useModel;
                    }
                } else {
                    $validations .= "            '{$name}' => 'required',\n";
                }
            }
        }
        
        $usesStr = implode("\n", $useStatements);
        
        $withStr = "";
        if (count($relations) > 0) {
            $withFuncs = array_map(fn($r) => "'" . $r['func'] . "'", $relations);
            $withStr = "with([" . implode(", ", $withFuncs) . "])->get()";
        } else {
            $withStr = "all()";
        }
        
        $relatedDataProps = "";
        foreach ($relations as $r) {
            $propName = Str::camel(Str::plural($r['model'])); // e.g. kategoris
            $relatedDataProps .= "\n            '{$propName}' => {$r['model']}::all(),";
        }

        $stub = "<?php
namespace App\Http\Controllers;

{$usesStr}
use Illuminate\Http\Request;
use Inertia\Inertia;

class {$modelName}Controller extends Controller
{
    public function index() {
        return Inertia::render('{$folderName}/index', [
            'data' => {$modelName}::{$withStr}
        ]);
    }

    public function create() {
        return Inertia::render('{$folderName}/create', [{$relatedDataProps}
        ]);
    }

    public function store(Request \$request) {
        \$validated = \$request->validate([
{$validations}        ]);
        {$modelName}::create(\$validated);
        return redirect()->route('{$routeName}.index')->with('success', 'Data created!');
    }

    public function edit({$modelName} \$" . strtolower($modelName) . ") {
        return Inertia::render('{$folderName}/edit', [
            'model' => \$" . strtolower($modelName) . ",{$relatedDataProps}
        ]);
    }

    public function update(Request \$request, {$modelName} \$" . strtolower($modelName) . ") {
        \$validated = \$request->validate([
{$validations}        ]);
        \$" . strtolower($modelName) . "->update(\$validated);
        return redirect()->route('{$routeName}.index')->with('success', 'Data updated!');
    }

    public function destroy({$modelName} \$" . strtolower($modelName) . ") {
        \$" . strtolower($modelName) . "->delete();
        return redirect()->route('{$routeName}.index')->with('success', 'Data deleted!');
    }
}
";
        File::put(app_path("Http/Controllers/{$modelName}Controller.php"), $stub);
    }

    private function generateReactViews($modelName, $folderName, $routeName, $fields, $hasChart = false, $hasSummary = false, $description = '')
    {
        $dir = resource_path("js/pages/{$folderName}");
        if (!File::exists($dir)) File::makeDirectory($dir, 0755, true);

        // --- INDEX VIEW ---
        $th = "";
        $td = "";
        foreach ($fields as $f) {
            $name = Str::snake($f['name']);
            $label = Str::title(str_replace('_', ' ', $name));
            $th .= "<th className=\"p-3 text-left font-semibold\">{$label}</th>\n";
            
            if ($f['type'] === 'relation' && !empty($f['related_model'])) {
                $funcName = Str::camel(str_replace('_id', '', $name));
                $td .= "<td className=\"p-3\">{item.{$funcName} ? (item.{$funcName}.name || item.{$funcName}.title || item.{$funcName}.nama || item.{$name}) : item.{$name}}</td>\n";
            } else {
                $td .= "<td className=\"p-3\">{item.{$name}}</td>\n";
            }
        }
        
        $chartImports = "";
        $chartJsx = "";
        if ($hasChart) {
            $chartImports = "import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';";
            $chartJsx = "
                <div className=\"glass-panel rounded-2xl p-6 mb-6\">
                    <h2 className=\"text-lg font-bold text-gray-800 dark:text-gray-200 mb-4\">Statistik {$modelName}</h2>
                    <div className=\"h-64\">
                        <ResponsiveContainer width=\"100%\" height=\"100%\">
                            <AreaChart data={[{name: 'Jan', total: 40}, {name: 'Feb', total: 30}, {name: 'Mar', total: 50}, {name: 'Apr', total: 45}, {name: 'Mei', total: 60}]}>
                                <defs>
                                    <linearGradient id=\"colorTotal\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
                                        <stop offset=\"5%\" stopColor=\"#6366f1\" stopOpacity={0.8}/>
                                        <stop offset=\"95%\" stopColor=\"#6366f1\" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray=\"3 3\" stroke=\"rgba(255,255,255,0.1)\" vertical={false} />
                                <XAxis dataKey=\"name\" stroke=\"#888\" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke=\"#888\" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                <Area type=\"monotone\" dataKey=\"total\" stroke=\"#6366f1\" strokeWidth={3} fillOpacity={1} fill=\"url(#colorTotal)\" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>";
        }
        
        $summaryJsx = "";
        if ($hasSummary) {
            $summaryJsx = "
                <div className=\"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6\">
                    {[
                        { title: 'Total Data', value: data.length, color: 'from-blue-500 to-indigo-600' },
                        { title: 'Aktif', value: Math.floor(data.length * 0.8), color: 'from-emerald-400 to-teal-500' },
                        { title: 'Pending', value: Math.floor(data.length * 0.2), color: 'from-amber-400 to-orange-500' },
                        { title: 'Pertumbuhan', value: '+12%', color: 'from-purple-500 to-pink-500' }
                    ].map((stat, i) => (
                        <div key={i} className=\"p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 shadow-lg relative overflow-hidden\">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br \${stat.color} opacity-20 rounded-bl-full`}></div>
                            <h3 className=\"text-sm font-medium text-gray-500 dark:text-gray-400 mb-1\">{stat.title}</h3>
                            <p className=\"text-3xl font-extrabold text-gray-800 dark:text-gray-100\">{stat.value}</p>
                        </div>
                    ))}
                </div>";
        }

        $descJsx = "";
        if (!empty($description)) {
            $descJsx = "<p className=\"text-gray-500 dark:text-gray-400 mt-1 mb-6\">{$description}</p>";
        }

        $indexStub = "import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { glassBtnPrimaryClass, glassPageTitleClass } from '@/lib/glass-styles';
$chartImports

export default function Index({ data }: any) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: '{$modelName}', href: '/{$routeName}' }]}>
            <Head title=\"{$modelName}\" />
            <div className=\"p-4 md:p-6\">
                <div className=\"flex justify-between items-start mb-1\">
                    <div>
                        <h1 className={glassPageTitleClass}>{$modelName}</h1>
                        $descJsx
                    </div>
                    <Link href={`/{$routeName}/create`} className={glassBtnPrimaryClass}>Tambah Baru</Link>
                </div>
                
                $summaryJsx
                
                $chartJsx
                
                <div className=\"glass-panel rounded-2xl overflow-hidden\">
                    <table className=\"w-full text-sm\">
                        <thead className=\"bg-white/10 border-b border-white/20\">
                            <tr>
                                <th className=\"p-3 text-left font-semibold\">ID</th>
{$th}                                <th className=\"p-3 text-left font-semibold\">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className=\"divide-y divide-white/10\">
                            {data.map((item: any) => (
                                <tr key={item.id} className=\"hover:bg-white/5\">
                                    <td className=\"p-3\">{item.id}</td>
{$td}                                    <td className=\"p-3 flex gap-2\">
                                        <Link href={`/{$routeName}/\${item.id}/edit`} className=\"text-blue-400 hover:underline\">Edit</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}";
        File::put("{$dir}/index.tsx", $indexStub);

        // --- CREATE VIEW ---
        $inputs = "";
        $useFormData = [];
        foreach ($fields as $f) {
            $name = Str::snake($f['name']);
            $label = Str::title(str_replace('_', ' ', $name));
            $useFormData[] = "{$name}: ''";
            
            if ($f['type'] === 'relation' && !empty($f['related_model'])) {
                $propName = Str::camel(Str::plural(Str::studly(Str::singular($f['related_model']))));
                $inputs .= "
                    <div className=\"flex flex-col gap-1\">
                        <label className={`text-sm font-semibold \${glassLabelClass}`}>{$label}</label>
                        <select className={glassInputClass} value={data.{$name}} onChange={e => setData('{$name}', e.target.value)}>
                            <option value=\"\">-- Pilih {$label} --</option>
                            {props.{$propName}?.map((opt: any) => (
                                <option key={opt.id} value={opt.id}>{opt.name || opt.title || opt.nama || opt.id}</option>
                            ))}
                        </select>
                    </div>";
            } else {
                $inputs .= "
                    <div className=\"flex flex-col gap-1\">
                        <label className={`text-sm font-semibold \${glassLabelClass}`}>{$label}</label>
                        <input type=\"text\" className={glassInputClass} value={data.{$name}} onChange={e => setData('{$name}', e.target.value)} />
                    </div>";
            }
        }
        $useFormStr = implode(', ', $useFormData);

        $createStub = "import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { glassBtnPrimaryClass, glassBtnSecondaryClass, glassInputClass, glassLabelClass, glassPageTitleClass } from '@/lib/glass-styles';

export default function Create(props: any) {
    const { data, setData, post, processing } = useForm({ {$useFormStr} });

    function submit(e: any) {
        e.preventDefault();
        post('/{$routeName}');
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: '{$modelName}', href: '/{$routeName}' }, { title: 'Tambah', href: '#' }]}>
            <Head title=\"Tambah {$modelName}\" />
            <div className=\"mx-auto max-w-lg p-4 md:p-6\">
                <h1 className={`mb-6 \${glassPageTitleClass}`}>Tambah {$modelName}</h1>
                <form onSubmit={submit} className=\"glass-panel rounded-2xl p-5 flex flex-col gap-4\">
{$inputs}
                    <div className=\"flex justify-end gap-3 pt-2\">
                        <Link href={`/{$routeName}`} className={glassBtnSecondaryClass}>Batal</Link>
                        <button type=\"submit\" disabled={processing} className={glassBtnPrimaryClass}>Simpan</button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}";
        File::put("{$dir}/create.tsx", $createStub);

        // --- EDIT VIEW ---
        $editInputs = "";
        foreach ($fields as $f) {
            $name = Str::snake($f['name']);
            $label = Str::title(str_replace('_', ' ', $name));
            
            if ($f['type'] === 'relation' && !empty($f['related_model'])) {
                $propName = Str::camel(Str::plural(Str::studly(Str::singular($f['related_model']))));
                $editInputs .= "
                    <div className=\"flex flex-col gap-1\">
                        <label className={`text-sm font-semibold \${glassLabelClass}`}>{$label}</label>
                        <select className={glassInputClass} value={data.{$name}} onChange={e => setData('{$name}', e.target.value)}>
                            <option value=\"\">-- Pilih {$label} --</option>
                            {props.{$propName}?.map((opt: any) => (
                                <option key={opt.id} value={opt.id}>{opt.name || opt.title || opt.nama || opt.id}</option>
                            ))}
                        </select>
                    </div>";
            } else {
                $editInputs .= "
                    <div className=\"flex flex-col gap-1\">
                        <label className={`text-sm font-semibold \${glassLabelClass}`}>{$label}</label>
                        <input type=\"text\" className={glassInputClass} value={data.{$name}} onChange={e => setData('{$name}', e.target.value)} />
                    </div>";
            }
        }
        $editStub = "import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { glassBtnPrimaryClass, glassBtnSecondaryClass, glassInputClass, glassLabelClass, glassPageTitleClass } from '@/lib/glass-styles';

export default function Edit(props: any) {
    const { model } = props;
    const { data, setData, put, processing } = useForm(model);

    function submit(e: any) {
        e.preventDefault();
        put(`/{$routeName}/\${model.id}`);
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: '{$modelName}', href: '/{$routeName}' }, { title: 'Edit', href: '#' }]}>
            <Head title=\"Edit {$modelName}\" />
            <div className=\"mx-auto max-w-lg p-4 md:p-6\">
                <h1 className={`mb-6 \${glassPageTitleClass}`}>Edit {$modelName}</h1>
                <form onSubmit={submit} className=\"glass-panel rounded-2xl p-5 flex flex-col gap-4\">
{$editInputs}
                    <div className=\"flex justify-end gap-3 pt-2\">
                        <Link href={`/{$routeName}`} className={glassBtnSecondaryClass}>Batal</Link>
                        <button type=\"submit\" disabled={processing} className={glassBtnPrimaryClass}>Update</button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}";
        File::put("{$dir}/edit.tsx", $editStub);
    }

    private function appendRoute($modelName, $routeName)
    {
        $routesFile = base_path('routes/web.php');
        $routes = File::get($routesFile);
        
        $routeDef = "\nRoute::resource('{$routeName}', \App\Http\Controllers\\{$modelName}Controller::class)->middleware(['auth']);";
        
        if (!str_contains($routes, "Route::resource('{$routeName}'")) {
            File::append($routesFile, $routeDef);
        }
    }

    private function appendNavigation($modelName, $routeName)
    {
        $navFile = resource_path('js/lib/navigation.ts');
        if (File::exists($navFile)) {
            $content = File::get($navFile);
            
            $newMenu = "    items.push({\n        title: '{$modelName}',\n        url: '/{$routeName}',\n        icon: LayoutGrid,\n    });\n\n    return items;";
            
            // Hindari duplikasi jika sudah pernah dibuat
            if (!str_contains($content, "url: '/{$routeName}'")) {
                $content = str_replace('    return items;', $newMenu, $content);
                File::put($navFile, $content);
            }
        }
    }

    public function destroyMenu($name)
    {
        // Variasi 1: Standard Laravel plural/singular (Bisa salah untuk kata Indonesia)
        $modelName1 = Str::studly(Str::singular($name));
        $tableName1 = Str::snake(Str::plural($modelName1));
        $routeName1 = Str::kebab(Str::plural($modelName1));
        $folderName1 = Str::kebab($modelName1);

        // Variasi 2: Nama asli tanpa plural/singular
        $modelName2 = Str::studly($name);
        $tableName2 = Str::snake($name);
        $routeName2 = Str::kebab($name);
        $folderName2 = Str::kebab($modelName2);

        // 1. Drop Tables
        \Illuminate\Support\Facades\Schema::dropIfExists($tableName1);
        \Illuminate\Support\Facades\Schema::dropIfExists($tableName2);

        // 2. Delete Models
        File::delete(app_path("Models/{$modelName1}.php"));
        File::delete(app_path("Models/{$modelName2}.php"));

        // 3. Delete Controllers
        File::delete(app_path("Http/Controllers/{$modelName1}Controller.php"));
        File::delete(app_path("Http/Controllers/{$modelName2}Controller.php"));

        // 4. Delete React Views
        File::deleteDirectory(resource_path("js/pages/{$folderName1}"));
        File::deleteDirectory(resource_path("js/pages/{$folderName2}"));

        // 5. Delete Schema JSONs
        File::delete(storage_path("app/builder/schemas/" . Str::kebab($modelName1) . ".json"));
        File::delete(storage_path("app/builder/schemas/" . Str::kebab($name) . ".json"));

        // 6. Delete Routes
        $routesFile = base_path('routes/web.php');
        if (File::exists($routesFile)) {
            $routes = File::get($routesFile);
            $routeDef1 = "\nRoute::resource('{$routeName1}', \App\Http\Controllers\\{$modelName1}Controller::class)->middleware(['auth']);";
            $routeDef2 = "\nRoute::resource('{$routeName2}', \App\Http\Controllers\\{$modelName2}Controller::class)->middleware(['auth']);";
            $routes = str_replace([$routeDef1, $routeDef2], "", $routes);
            File::put($routesFile, $routes);
        }

        // 7. Delete Navigations
        $navFile = resource_path('js/lib/navigation.ts');
        if (File::exists($navFile)) {
            $content = File::get($navFile);
            $pattern1 = "/\s*items\.push\(\{[^}]*?url:\s*'\/$routeName1'[^}]*?\}\);/s";
            $pattern2 = "/\s*items\.push\(\{[^}]*?url:\s*'\/$routeName2'[^}]*?\}\);/s";
            $content = preg_replace($pattern1, '', $content);
            $content = preg_replace($pattern2, '', $content);
            File::put($navFile, $content);
        }

        return redirect()->back()->with('success', "Resource $name berhasil dihapus!");
    }
}
