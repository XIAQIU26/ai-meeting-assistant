import { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { Card } from '../components/Card';
import { askAssistant } from '../services/api';

interface ChatPageProps {
  projectId: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const prompts = ['导师最近关注哪些问题？', '我有哪些任务没有完成？', '我的研究方向有没有变化？', '关于理论框架导师都说过什么？', '下次组会前我该准备什么？'];

export function ChatPage({ projectId }: ChatPageProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(text = question) {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setQuestion('');
    try {
      const result = await askAssistant(text, projectId);
      setMessages((prev) => [...prev, { role: 'assistant', content: result.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成回答失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <Card title="你可以问任意问题">
        <div className="space-y-2">
          <p className="text-xs leading-5 text-slate-500">AI 会读取<strong className="text-slate-700">当前课题</strong>的历史组会记录，根据你的问题检索最相关的内容并回答。下面是一些示例，你也可以直接在右侧输入任何问题。</p>
          {prompts.map((prompt) => (
            <button key={prompt} className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50" onClick={() => send(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      </Card>

      <Card title="AI 科研助手">
        <div className="mb-4 min-h-[360px] space-y-3 rounded-md bg-slate-50 p-4">
          {messages.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center text-center text-sm text-slate-500">
              <Bot className="mb-3 text-research-500" size={28} />
              针对当前课题的历史组会记录提问，AI 会基于上下文检索并回答。
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] whitespace-pre-line rounded-lg px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-research-500 text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                  {message.content}
                </div>
              </div>
            ))
          )}
          {loading && <div className="text-center text-xs text-slate-400">AI 正在检索当前课题的组会记录...</div>}
          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        </div>
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-research-500 focus:ring-2 focus:ring-research-100"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') send();
            }}
            placeholder="针对当前课题提问，例如：导师对数据分析方法提过什么建议？"
          />
          <button
            className="inline-flex items-center gap-2 rounded-md bg-research-500 px-4 py-2 text-sm font-medium text-white hover:bg-research-700 disabled:opacity-60"
            onClick={() => send()}
            disabled={loading || !question.trim()}
          >
            <Send size={16} /> {loading ? '生成中' : '发送'}
          </button>
        </div>
      </Card>
    </div>
  );
}
