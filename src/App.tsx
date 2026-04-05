import { useState } from 'react';
import { Download, Plus, Trash2, Copy, FileCode2, LayoutTemplate, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export type ChecklistItem = {
  id: string;
  text: string;
};

export type ChecklistData = {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
};

function App() {
  const [data, setData] = useState<ChecklistData>({
    id: `checklist_${Math.random().toString(36).substr(2, 9)}`,
    title: 'Мой первый чеклист',
    description: 'Описание вашего чеклиста, инструкции и полезная информация для пользователей.',
    items: [
      { id: 'item_1', text: 'Первый пункт плана' },
      { id: 'item_2', text: 'Проверить все настройки' },
      { id: 'item_3', text: 'Скачать результат в PDF' }
    ]
  });

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: `item_${Date.now()}`, text: 'Новый пункт' }]
    }));
  };

  const updateItem = (id: string, newText: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, text: newText } : item)
    }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const generateHTML = () => {
    // Escape functions for basic HTML security in demo
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const itemsHtml = data.items.map(item => `
        <li class="zvero-checklist-item">
          <label class="zvero-checklist-label">
            <input type="checkbox" class="zvero-checklist-checkbox" data-item-id="${escapeHtml(item.id)}">
            <span class="zvero-checklist-text">${escapeHtml(item.text)}</span>
          </label>
        </li>`).join('');

    const htmlCode = `<!-- Подключите эти стили и скрипты в тег <head> или перед закрывающим </body> Вашего сайта (один раз на страницу) -->
<link rel="stylesheet" href="https://your-hosting.com/checklist-styles.css">
<!-- Библиотека для генерации PDF (подключать обязательно если нужна кнопка скачивания) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<!-- Скрипт инициализации -->
<script src="https://your-hosting.com/checklist-init.js" defer></script>

<!-- Код Чеклиста -->
<div class="zvero-checklist" data-checklist-id="${escapeHtml(data.id)}">
  <div class="zvero-checklist-header">
    <h3 class="zvero-checklist-title">${escapeHtml(data.title)}</h3>
    ${data.description ? `<p class="zvero-checklist-desc">${escapeHtml(data.description)}</p>` : ''}
  </div>
  
  <ul class="zvero-checklist-items">
${itemsHtml}
  </ul>
  
  <div class="zvero-checklist-footer">
    <button class="zvero-checklist-btn-pdf" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      Скачать PDF
    </button>
  </div>
</div>`;
    return htmlCode;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateHTML()).then(() => {
      toast.success('Код скопирован в буфер обмена!');
    }).catch(err => {
      toast.error('Ошибка копирования');
      console.error(err);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8 font-sans">
      <Toaster position="top-center" />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-0 flex items-center gap-2">
          <Settings2 className="h-8 w-8 text-purple-600" />
          Zveroland Генератор Чеклистов
        </h1>
        <p className="text-slate-500 mt-2">
          Создайте интерактивный чеклист и встройте его на свой сайт.
        </p>
      </header>

      <main className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto w-full flex-grow">
        
        {/* Left Column: Editor & Output Tabs */}
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="editor" className="flex gap-2">
                <LayoutTemplate className="w-4 h-4" />
                Конструктор
              </TabsTrigger>
              <TabsTrigger value="code" className="flex gap-2 text-purple-600 data-[state=active]:text-purple-700">
                <FileCode2 className="w-4 h-4" />
                HTML Код & Экспорт
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="mt-0 outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки чеклиста</CardTitle>
                  <CardDescription>Измените название, описание и пункты плана ниже.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Название</Label>
                      <Input 
                        id="title" 
                        value={data.title} 
                        onChange={(e) => setData({ ...data, title: e.target.value })} 
                        placeholder="Название чеклиста"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc">Описание (опционально)</Label>
                      <Textarea 
                        id="desc" 
                        value={data.description} 
                        onChange={(e) => setData({ ...data, description: e.target.value })} 
                        placeholder="Краткое описание" 
                        className="resize-none"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Пункты ({data.items.length})</Label>
                    </div>
                    <ScrollArea className="h-[300px] rounded-md border p-4 bg-slate-50/50">
                      <div className="space-y-3">
                        {data.items.map((item, index) => (
                          <div key={item.id} className="flex flex-col gap-2 group relative bg-white p-3 rounded-lg border shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className="bg-slate-100 text-slate-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium shrink-0 mt-2">
                                {index + 1}
                              </div>
                              <Textarea
                                value={item.text}
                                onChange={(e) => updateItem(item.id, e.target.value)}
                                className="min-h-[60px] resize-none"
                                placeholder={`Пункт чеклиста ${index + 1}`}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-slate-400 hover:text-red-500 shrink-0 mt-1"
                                onClick={() => removeItem(item.id)}
                                title="Удалить пункт"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <Button onClick={addItem} variant="outline" className="w-full border-dashed flex gap-2">
                      <Plus className="w-4 h-4" />
                      Добавить пункт
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="mt-0 outline-none">
              <Card className="border-purple-200 shadow-md">
                <CardHeader className="bg-purple-50/50 border-b border-purple-100 rounded-t-xl mb-4 p-6">
                  <CardTitle className="text-purple-800">HTML Код чеклиста</CardTitle>
                  <CardDescription>Установите этот код на ваш сайт для отображения чеклиста.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <strong>Внимание:</strong> Не забудьте заменить <code>https://your-hosting.com/</code> на реальный адрес, где будут лежать файлы <code>checklist-styles.css</code> и <code>checklist-init.js</code> (например, ваш Github Pages).
                  </p>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-slate-900 text-slate-50 text-sm overflow-x-auto">
                      <code>{generateHTML()}</code>
                    </pre>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t p-4 rounded-b-xl flex justify-end">
                  <Button onClick={copyToClipboard} className="bg-purple-600 hover:bg-purple-700 text-white flex gap-2">
                    <Copy className="w-4 h-4" />
                    Копировать код
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Live Preview */}
        <div className="flex flex-col">
          <div className="mb-6 h-10 flex items-center">
            <h2 className="text-xl font-semibold m-0 text-slate-800 flex items-center gap-2">
               Предпросмотр (Live Preview)
            </h2>
          </div>
          
          <Card className="flex-grow bg-slate-200 overflow-hidden relative border-none shadow-inner flex items-center justify-center p-8">
            <div className="absolute inset-0 pattern-dots pattern-slate-300 pattern-bg-white pattern-size-4 pattern-opacity-20 z-0"></div>
            
            <div className="z-10 w-full">
              {/* This mimics the generated .zvero-checklist structure applying generic style logic for preview so we don't rely only on global external css here */}
              <div className="bg-white border rounded-lg p-6 max-w-[500px] w-full mx-auto shadow-sm text-left">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold mb-2 leading-tight text-slate-900">{data.title || 'Без названия'}</h3>
                  {data.description && <p className="text-slate-600 text-base">{data.description}</p>}
                </div>
                
                <ul className="space-y-3 mb-6 p-0 m-0 list-none">
                  {data.items.map((item) => (
                    <li key={item.id}>
                      <Label className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer transition-colors border border-transparent hover:border-slate-100 group">
                        <Checkbox 
                          id={`preview_${item.id}`} 
                          className="mt-1 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 w-5 h-5 rounded"
                        />
                        <span className="text-slate-700 text-base leading-relaxed group-hover:text-slate-900 peer-data-[state=checked]:line-through peer-data-[state=checked]:text-slate-400">
                          {item.text || 'Пустой пункт'}
                        </span>
                      </Label>
                    </li>
                  ))}
                  {data.items.length === 0 && (
                    <p className="text-sm text-slate-400 italic text-center py-4">Добавьте пункты для отображения</p>
                  )}
                </ul>

                <div className="flex justify-end pt-4 border-t">
                   <Button className="bg-purple-600 hover:bg-purple-700 gap-2 font-medium">
                     <Download className="w-4 h-4" />
                     Скачать PDF
                   </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </main>
    </div>
  );
}

export default App;
