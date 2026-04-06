import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  FileCode2,
  LayoutTemplate,
  Minus,
  GripVertical,
  Download,
  FileBracesCorner,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export type ChecklistItem = {
  id: string;
  text: string;
};

export type ChecklistBlock = {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
};

export type ChecklistData = {
  id: string;
  imageUrl: string;
  blocks: ChecklistBlock[];
};

function IframePreview({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="checklist-styles.css">
  <style>body { margin: 0; padding: 1.25rem; display:flex; justify-content:center; background: transparent; }</style>
</head>
<body>${html}</body>
</html>`);
    doc.close();
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full border-0 rounded-xl"
      style={{ minHeight: "400px", height: "auto" }}
      title="Checklist Preview"
      scrolling="no"
      onLoad={(e) => {
        const iframe = e.currentTarget;
        const body = iframe.contentDocument?.body;
        if (body) {
          iframe.style.height = body.scrollHeight + "px";
        }
      }}
    />
  );
}

function App() {
  const [data, setData] = useState<ChecklistData>({
    id: `checklist_${Math.random().toString(36).substr(2, 9)}`,
    imageUrl: "",
    blocks: [
      {
        id: "block_1",
        title: "Основной этап",
        description: "",
        items: [
          { id: "item_1", text: "Первый пункт плана" },
          { id: "item_2", text: "Проверить все настройки" },
          { id: "item_3", text: "Скачать результат в PDF" },
        ],
      },
    ],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checklist-${data.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Чеклист скачан");
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && typeof json === "object" && Array.isArray(json.blocks)) {
          setData(json);
          toast.success("Чеклист загружен");
        } else {
          toast.error("Неверный формат чеклиста");
        }
      } catch (err) {
        toast.error("Ошибка чтения файла");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const addBlock = () => {
    setData((prev) => ({
      ...prev,
      blocks: [
        ...prev.blocks,
        {
          id: `block_${Date.now()}`,
          title: "Новый блок",
          description: "",
          items: [{ id: `item_${Date.now()}_1`, text: "Новый пункт" }],
        },
      ],
    }));
  };

  const updateBlock = (
    blockId: string,
    field: "title" | "description",
    value: string,
  ) => {
    setData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId ? { ...b, [field]: value } : b,
      ),
    }));
  };

  const removeBlock = (blockId: string) => {
    setData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== blockId),
    }));
  };

  const addItemToBlock = (blockId: string) => {
    setData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId
          ? {
              ...b,
              items: [
                ...b.items,
                { id: `item_${Date.now()}`, text: "Новый пункт" },
              ],
            }
          : b,
      ),
    }));
  };

  const updateItemInBlock = (
    blockId: string,
    itemId: string,
    newText: string,
  ) => {
    setData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId
          ? {
              ...b,
              items: b.items.map((item) =>
                item.id === itemId ? { ...item, text: newText } : item,
              ),
            }
          : b,
      ),
    }));
  };

  const removeItemFromBlock = (blockId: string, itemId: string) => {
    setData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId
          ? {
              ...b,
              items: b.items.filter((item) => item.id !== itemId),
            }
          : b,
      ),
    }));
  };

  const dragItemIndex = useRef<number | null>(null);
  const dragBlockIndex = useRef<number | null>(null);
  const dragBlockWholeIndex = useRef<number | null>(null);

  const handleBlockDragStart = (blockIndex: number) => {
    // Only drag the block if we aren't dragging an item
    dragBlockWholeIndex.current = blockIndex;
  };

  const handleBlockDragOver = (e: React.DragEvent, overBlockIndex: number) => {
    e.preventDefault();
    const from = dragBlockWholeIndex.current;
    if (from === null || from === overBlockIndex) return;

    setData((prev) => {
      const blocks = [...prev.blocks];
      const [moved] = blocks.splice(from, 1);
      blocks.splice(overBlockIndex, 0, moved);
      dragBlockWholeIndex.current = overBlockIndex;
      return { ...prev, blocks };
    });
  };

  const handleBlockDragEnd = () => {
    dragBlockWholeIndex.current = null;
  };

  const handleDragStart = (
    e: React.DragEvent,
    blockIndex: number,
    itemIndex: number,
  ) => {
    e.stopPropagation(); // Prevent dragging the block
    dragBlockIndex.current = blockIndex;
    dragItemIndex.current = itemIndex;
  };

  const handleDragOver = (
    e: React.DragEvent,
    blockIndex: number,
    overItemIndex: number,
  ) => {
    e.preventDefault();
    e.stopPropagation(); // Avoid triggering block drag over

    if (dragBlockIndex.current !== blockIndex) return; // Prevent dnd across blocks for now

    const from = dragItemIndex.current;
    if (from === null || from === overItemIndex) return;

    setData((prev) => {
      const newBlocks = [...prev.blocks];
      const block = { ...newBlocks[blockIndex] };
      const items = [...block.items];

      const [moved] = items.splice(from, 1);
      items.splice(overItemIndex, 0, moved);

      block.items = items;
      newBlocks[blockIndex] = block;

      dragItemIndex.current = overItemIndex;

      return { ...prev, blocks: newBlocks };
    });
  };

  const handleDragEnd = () => {
    dragItemIndex.current = null;
    dragBlockIndex.current = null;
  };

  const generateHeadHTML = () => {
    return `<!-- Подключите эти стили и скрипты в тег <head> или перед закрывающим </body> Вашего сайта (один раз на страницу) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kennyhouston-hw/Zveroland_CGenerator/checklist-styles.css">
<!-- Библиотека для генерации PDF -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<!-- Скрипт инициализации -->
<script src="https://cdn.jsdelivr.net/gh/kennyhouston-hw/Zveroland_CGenerator/checklist-init.js" defer></script>`;
  };

  const generateBodyHTML = () => {
    // Escape functions for basic HTML security in demo
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const blocksHtml = data.blocks
      .map((block) => {
        const itemsHtml = block.items
          .map(
            (item) => `
        <li class="zvero-checklist-item">
          <label class="zvero-checklist-label">
            <input type="checkbox" class="zvero-checklist-checkbox" data-item-id="${escapeHtml(item.id)}">
            <span class="zvero-checklist-text">${escapeHtml(item.text)}</span>
          </label>
        </li>`,
          )
          .join("");

        return `
  <div class="zvero-checklist-block" data-block-id="${escapeHtml(block.id)}">
    ${
      block.title
        ? `<h4 class="zvero-checklist-block-title">${escapeHtml(block.title)}</h4>`
        : ""
    }
    ${
      block.description
        ? `<p class="zvero-checklist-block-desc">${escapeHtml(block.description)}</p>`
        : ""
    }
    <ul class="zvero-checklist-items">
${itemsHtml}
    </ul>
  </div>`;
      })
      .join("");

    return `<!-- Код Чеклиста -->
<div class="zvero-checklist" data-checklist-id="${escapeHtml(data.id)}">
    ${data.imageUrl ? `<img src="${escapeHtml(data.imageUrl)}" alt="Обложка чеклиста" class="zvero-checklist-cover" />` : ""}
  ${blocksHtml}
  <div class="zvero-checklist-footer">
    <button class="zvero-checklist-btn-pdf" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      Скачать PDF
    </button>
  </div>
</div>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Код скопирован в буфер обмена!");
      })
      .catch((err) => {
        toast.error("Ошибка копирования");
        console.error(err);
      });
  };

  return (
    <div className="min-h-screen max-w-4xl flex flex-col p-4 md:p-8 font-sans mx-auto">
      <Toaster position="top-center" />
      <header className="mb-8">
        <h1 className="text-3xl font-meduim text-slate-900 mt-0 flex items-center gap-2">
          Генератор Чеклистов
        </h1>
      </header>

      <main className="flex flex-col gap-8 max-w-full mx-auto w-full">
        {/* Left Column: Editor & Output Tabs */}
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="editor" className="flex gap-2">
                <LayoutTemplate className="w-4 h-4" />
                Конструктор
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex gap-2">
                <Eye className="w-4 h-4" />
                Превью
              </TabsTrigger>
              <TabsTrigger value="code" className="flex gap-2">
                <FileCode2 className="w-4 h-4" />
                Экпорт
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="mt-0 outline-none">
              <Card>
                <CardHeader className="border-b py-4 flex flex-row gap-4 flex-wrap">
                  <div className="flex flex-col gap-1 grow">
                    <CardTitle>Чеклист</CardTitle>
                    <CardDescription className="text-sm">
                      Укажите обложку и настройте блоки с пунктами ниже.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={exportJSON}>
                      <Download className="w-4 h-4" />
                      Скачать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileBracesCorner className="w-4 h-4" />
                      Загрузить
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={importJSON}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-0">
                  <div className="space-y-2">
                    <Input
                      id="imageUrl"
                      value={data.imageUrl}
                      onChange={(e) =>
                        setData({ ...data, imageUrl: e.target.value })
                      }
                      placeholder="URL Обложки (Превью изображение)"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 border-dashed py-4 gap-4">
                      <Label className="text-base font-medium mb-0 shrink-0">
                        Блоки ({data.blocks.length})
                      </Label>
                    </div>

                    <div className="space-y-4">
                      {data.blocks.map((block, blockIndex) => (
                        <div
                          key={block.id}
                          draggable
                          onDragStart={() => handleBlockDragStart(blockIndex)}
                          onDragOver={(e) => handleBlockDragOver(e, blockIndex)}
                          onDragEnd={handleBlockDragEnd}
                          className="p-4 border border-neutral-200/50 rounded-xl space-y-2 group/block relative"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 hidden md:block">
                              <GripVertical className="h-4 w-4 mt-2" />
                            </div>
                            <div className="grow space-y-0">
                              <Input
                                value={block.title}
                                onChange={(e) =>
                                  updateBlock(block.id, "title", e.target.value)
                                }
                                placeholder="Заголовок блока (опционально, напр: 'Подготовка')"
                                className="text-lg md:text-lg font-medium leading-none p-0 border-0 active:ring-0 focus:ring-0 focus-visible:ring-0"
                              />
                              <Input
                                value={block.description}
                                onChange={(e) =>
                                  updateBlock(
                                    block.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="Описание блока (опционально)"
                                className="p-0 border-0 active:ring-0 focus:ring-0 focus-visible:ring-0"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => removeBlock(block.id)}
                              className="border-dashed hover:text-red-500 hover:bg-red-100/70 hover:border-red-200"
                              title="Удалить блок"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="">
                            {block.items.map((item, itemIndex) => (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={(e) =>
                                  handleDragStart(e, blockIndex, itemIndex)
                                }
                                onDragOver={(e) =>
                                  handleDragOver(e, blockIndex, itemIndex)
                                }
                                onDragEnd={(e) => {
                                  e.stopPropagation();
                                  handleDragEnd();
                                }}
                                className="flex flex-col gap-2 group relative bg-white border-b border-neutral-200/50 py-3 select-none"
                              >
                                <div className="flex items-center gap-1">
                                  <GripVertical className="h-4 w-4 text-neutral-300 group-hover:text-neutral-400 shrink-0 cursor-grab active:cursor-grabbing transition-colors" />
                                  <div className="bg-neutral-100 text-neutral-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium shrink-0">
                                    {itemIndex + 1}
                                  </div>
                                  <Input
                                    value={item.text}
                                    onChange={(e) =>
                                      updateItemInBlock(
                                        block.id,
                                        item.id,
                                        e.target.value,
                                      )
                                    }
                                    className="text-sm md:text-base border-0 focus:ring-0 focus-visible:ring-0 px-2"
                                    placeholder={`Пункт чеклиста ${itemIndex + 1}`}
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon-sm"
                                    className="border-dashed hover:text-red-500 hover:bg-red-100/70 hover:border-red-200 shrink-0"
                                    onClick={() =>
                                      removeItemFromBlock(block.id, item.id)
                                    }
                                    title="Удалить пункт"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={() => addItemToBlock(block.id)}
                            variant="outline"
                            size="icon-sm"
                            className="border-dashed hover:text-sky-600 hover:bg-sky-100/80 hover:border-sky-200"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={addBlock}
                      variant="default"
                      size="default"
                      className="flex gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Новый блок
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="code"
              className="mt-0 outline-none flex flex-col gap-6"
            >
              <Card className="">
                <CardHeader className="border-b flex py-4">
                  <div className="flex flex-col gap-1 grow">
                    <CardTitle className="">Скрипты и Стили (Общие)</CardTitle>
                    <CardDescription>
                      Подключаются один раз на страницу в &lt;head&gt; или перед
                      закрывающим &lt;/body&gt;.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => copyToClipboard(generateHeadHTML())}
                    className="shrink-0 border-dashed hover:text-sky-600 hover:bg-sky-100/80 hover:border-sky-200"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="">
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-neutral-100 text-muted-foreground text-xs overflow-x-auto">
                      <code>{generateHeadHTML()}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="">
                <CardHeader className="border-b py-4 flex flex-row items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="">Код чеклиста</CardTitle>
                    <CardDescription>
                      Установите этот код в то место на сайте, где должен
                      отображаться чеклист.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(generateBodyHTML())}
                    variant="outline"
                    size="icon-sm"
                    className="shrink-0 border-dashed hover:text-sky-600 hover:bg-sky-100/80 hover:border-sky-200"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="">
                  <div className="relative max-h-[500px] overflow-auto">
                    <pre className="p-4 rounded-lg bg-neutral-100 text-muted-foreground text-xs overflow-x-auto">
                      <code>{generateBodyHTML()}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-0 outline-none">
              <Card className="overflow-hidden border-none bg-neutral-100 flex items-center justify-center min-h-[400px]">
                <div className="w-full">
                  <IframePreview html={generateBodyHTML()} />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Live Preview */}
      </main>
    </div>
  );
}

export default App;
