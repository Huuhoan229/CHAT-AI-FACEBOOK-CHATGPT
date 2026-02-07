'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../../lib/api';

export default function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
     LOAD LEAD
  ================================ */
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(
          `/admin/conversations/${params.id}`,
        );
        setLead(data);
      } catch (e) {
        console.error('Load lead error', e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  /* ===============================
     ACTIONS
  ================================ */
  async function action(url: string) {
    await apiPatch(url, {});
    const fresh = await apiGet(
      `/admin/conversations/${params.id}`,
    );
    setLead(fresh);
  }

  async function sendSaleMessage(
    formData: FormData,
  ) {
    const content = (
      formData.get('content') as string
    )?.trim();

    if (!content) return;

    // 🔥 frontend CHỈ gửi content
    await apiPatch(
      `/admin/conversations/${params.id}/sale-message`,
      { content },
    );

    const fresh = await apiGet(
      `/admin/conversations/${params.id}`,
    );
    setLead(fresh);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!lead) {
    return (
      <div className="text-red-500">
        Cannot load lead data
      </div>
    );
  }

  /* ===============================
     UI
  ================================ */
  return (
    <>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {lead.customerName || 'Facebook User'}
        </h1>
        <p className="text-sm text-gray-500">
          Status: <b>{lead.status}</b> | Bot:{' '}
          <b>
            {lead.botPaused ? 'Paused' : 'Active'}
          </b>
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex gap-2 mb-6">
        <button
          className="btn btn-green"
          onClick={() =>
            action(
              `/admin/conversations/${lead.id}/done-sale`,
            )
          }
        >
          Done Sale
        </button>

        <button
          className="btn btn-red"
          onClick={() =>
            action(
              `/admin/conversations/${lead.id}/block-bot`,
            )
          }
        >
          Block Bot
        </button>
      </div>

      {/* SALE CHAT */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="font-semibold mb-2">
          Sale Chat
        </h2>

        <form
          action={sendSaleMessage}
          className="flex gap-2"
        >
          <input
            name="content"
            placeholder="Ví dụ: .Dạ em chào anh | ,Shop hỗ trợ tiếp nhé"
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button className="btn btn-blue">
            Send
          </button>
        </form>

        <ul className="text-xs text-gray-500 mt-2 list-disc ml-4">
          <li>
            <b>.</b> đầu dòng → pause bot
          </li>
          <li>
            <b>,</b> đầu dòng → resume bot
          </li>
          <li>
            Bot vẫn ghi nhớ toàn bộ hội thoại
          </li>
        </ul>
      </div>

      {/* CHAT TIMELINE */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-4">
          Conversation Timeline
        </h2>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto">
          {lead.messages.length === 0 && (
            <div className="text-gray-400">
              No messages yet
            </div>
          )}

          {lead.messages.map((m: any) => {
            const isUser = m.sender === 'USER';
            const isBot = m.sender === 'BOT';
            const isSale = m.sender === 'SALE';

            return (
              <div
                key={m.id}
                className={`flex ${
                  isSale
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded px-3 py-2 text-sm shadow
                    ${
                      isUser
                        ? 'bg-slate-100'
                        : isBot
                        ? 'bg-blue-50'
                        : 'bg-green-50'
                    }
                  `}
                >
                  <div className="text-xs font-semibold mb-1 text-gray-600">
                    {isUser
                      ? 'Khách'
                      : isBot
                      ? 'Bot'
                      : 'Sale'}{' '}
                    ·{' '}
                    {new Date(
                      m.createdAt,
                    ).toLocaleTimeString()}
                  </div>

                  <div className="whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
