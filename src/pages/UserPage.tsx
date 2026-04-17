import { useEffect, useState } from 'react';
import { LogOut, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type TruthOrDareCard = {
  id: number;
  truth_text: string;
  dare_text: string;
  punishment_text: string | null;
  created_at: string;
};

const defaultDraft = {
  truth_text: '',
  dare_text: '',
  punishment_text: '',
};

function TruthOrDareGame({ cards }: { cards: TruthOrDareCard[] }) {
  const [drawnCard, setDrawnCard] = useState<TruthOrDareCard | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleDraw() {
    if (!cards.length) return;
    const randomIndex = Math.floor(Math.random() * cards.length);
    setDrawnCard(cards[randomIndex]);
    setRevealed(false);
  }

  return (
    <div className="glass rounded-[2rem] p-4 sm:p-6 text-white">
      <div className="mb-5 flex items-center gap-3">
        <button className="btn-primary w-full" onClick={handleDraw} disabled={!cards.length}>
          Rút bài
        </button>
        {!cards.length && (
          <span className="text-sm text-white/60">Chưa có bộ thẻ nào để chơi.</span>
        )}
      </div>

      <div className="flex justify-center">
        {!drawnCard ? (
          <div className="flex h-[58vh] min-h-[420px] w-full max-w-[380px] items-center justify-center rounded-[28px] border border-dashed border-white/20 bg-white/5 px-6 text-center text-white/40 sm:h-[420px] sm:w-[280px]">
            Chưa rút bài
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className={`h-[58vh] min-h-[420px] w-full max-w-[380px] rounded-[28px] border p-0 text-left transition sm:h-[420px] sm:w-[280px] ${
              revealed
                ? 'border-[#6b46ff] bg-white text-black'
                : 'border-white/15 bg-gradient-to-br from-[#150b20] to-[#090304] text-white'
            }`}
          >
            {!revealed ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="text-4xl font-bold text-[#8b5cf6]">Truth</div>
                <div className="mt-2 text-4xl font-bold text-[#8b5cf6]">or Dare</div>
                <div className="mt-6 text-sm text-white/70">Bấm vào lá bài để mở</div>
              </div>
            ) : (
              <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-white">
                <div className="flex-1 px-5 py-5 sm:px-6">
                  <div className="mb-2 text-3xl font-bold text-[#4c1d95]">Truth</div>
                  <div className="text-lg font-semibold leading-8 text-black sm:text-xl">
                    {drawnCard.truth_text}
                  </div>
                </div>

                <div className="bg-[#e9e2ff] px-5 py-5 sm:px-6">
                  <div className="mb-2 text-3xl font-bold text-[#4c1d95]">Dare</div>
                  <div className="text-lg font-semibold leading-8 text-black sm:text-xl">
                    {drawnCard.dare_text}
                  </div>

                  {drawnCard.punishment_text && (
                    <div className="mt-5 border-t border-black/10 pt-4">
                      <div className="mb-1 text-sm font-bold uppercase tracking-wide text-[#4c1d95]">
                        Phạt nếu không làm
                      </div>
                      <div className="text-base font-medium leading-7 text-black/80">
                        {drawnCard.punishment_text}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function UserPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'play'>('create');
  const [draft, setDraft] = useState(defaultDraft);
  const [cards, setCards] = useState<TruthOrDareCard[]>([]);
  const [busy, setBusy] = useState(false);

  const [playDrawerOpen, setPlayDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setPlayDrawerOpen(false);
    }
  }, [isMobile]);

  async function loadCards() {
    if (!supabase) {
      setCards([]);
      return;
    }

    const sb = supabase!;

    const { data, error } = await sb
      .from('truth_or_dare_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }

    setCards((data ?? []) as TruthOrDareCard[]);
  }

  useEffect(() => {
    void loadCards();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!draft.truth_text.trim() || !draft.dare_text.trim()) {
      toast.warning('Vui lòng nhập đủ Truth và Dare');
      return;
    }

    if (!supabase) {
      toast.error('Supabase chưa được cấu hình.');
      return;
    }

    const sb = supabase!;

    setBusy(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await sb.auth.getUser();

      if (userError || !user) {
        toast.error('Không tìm thấy thông tin đăng nhập.');
        return;
      }

      const { error } = await sb.from('truth_or_dare_cards').insert({
        truth_text: draft.truth_text.trim(),
        dare_text: draft.dare_text.trim(),
        punishment_text: draft.punishment_text.trim(),
        created_by: user.id,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setDraft(defaultDraft);
      await loadCards();
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    if (!supabase) return;

    const sb = supabase!;
    await sb.auth.signOut();
    window.location.reload();
  }

  function handleOpenPlay() {
    if (isMobile) {
      setPlayDrawerOpen(true);
      return;
    }

    setActiveTab('play');
  }

  function handleOpenCreate() {
    setActiveTab('create');
    setPlayDrawerOpen(false);
  }

  return (
    <>
      <div className="min-h-screen bg-[#080304] px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-brand-gold">User</div>
              <h1 className="mt-2 text-3xl font-semibold">Truth or Dare</h1>
              <p className="mt-2 text-sm text-white/60">
                Tạo bộ thẻ gồm Truth, Dare và hình phạt, sau đó mở trò chơi để rút bài.
              </p>
            </div>

            <button className="btn-secondary gap-2" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              className={`rounded-full px-4 py-2 text-sm ${
                activeTab === 'create' && !playDrawerOpen
                  ? 'bg-brand-gold text-brand-dark'
                  : 'bg-white/5 text-white/70'
              }`}
              onClick={handleOpenCreate}
            >
              Thêm bộ thẻ
            </button>

            <button
              className={`rounded-full px-4 py-2 text-sm ${
                activeTab === 'play' || playDrawerOpen
                  ? 'bg-brand-gold text-brand-dark'
                  : 'bg-white/5 text-white/70'
              }`}
              onClick={handleOpenPlay}
            >
              Chơi ngay
            </button>
          </div>

          {activeTab === 'create' ? (
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <form onSubmit={handleCreate} className="glass space-y-4 rounded-[2rem] p-5">
                <div>
                  <label className="mb-2 block text-sm text-white/70">Truth</label>
                  <textarea
                    className="input min-h-28"
                    value={draft.truth_text}
                    onChange={(e) => setDraft({ ...draft, truth_text: e.target.value })}
                    placeholder="Ví dụ: Kể về một lần bạn ghen"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Dare</label>
                  <textarea
                    className="input min-h-28"
                    value={draft.dare_text}
                    onChange={(e) => setDraft({ ...draft, dare_text: e.target.value })}
                    placeholder="Ví dụ: Đặt tay xuống gót chân cho đến lượt chơi kế tiếp"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Hình phạt</label>
                  <textarea
                    className="input min-h-24"
                    value={draft.punishment_text}
                    onChange={(e) => setDraft({ ...draft, punishment_text: e.target.value })}
                    placeholder="Ví dụ: Hát 1 bài hoặc nhảy 10 cái"
                  />
                </div>

                <button className="btn-primary" disabled={busy}>
                  {busy ? 'Đang lưu...' : 'Lưu bộ thẻ'}
                </button>
              </form>

              <div className="glass rounded-[2rem] p-5">
                <div className="mb-4 text-lg font-semibold">Danh sách bộ thẻ</div>
                <div className="space-y-4">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mb-2">
                        <div className="text-xs uppercase text-brand-gold">Truth</div>
                        <div className="text-sm text-white/85">{card.truth_text}</div>
                      </div>
                      <div className="mb-2">
                        <div className="text-xs uppercase text-brand-gold">Dare</div>
                        <div className="text-sm text-white/85">{card.dare_text}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase text-brand-gold">Hình phạt</div>
                        <div className="text-sm text-white/70">
                          {card.punishment_text || 'Không có'}
                        </div>
                      </div>
                    </div>
                  ))}

                  {!cards.length && (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-white/50">
                      Chưa có bộ thẻ nào.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : !isMobile ? (
            <TruthOrDareGame cards={cards} />
          ) : null}
        </div>
      </div>

      {isMobile && playDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setPlayDrawerOpen(false)}
            aria-label="Đóng drawer"
          />

          <div className="absolute inset-y-0 right-0 flex w-full flex-col bg-[#080304] text-white shadow-2xl transition-transform duration-300">
            <div className="sticky top-0 z-10 border-b border-white/10 bg-[#080304]/95 backdrop-blur">
              <div className="flex items-center gap-3 px-4 py-4">
                <button
                  type="button"
                  onClick={() => setPlayDrawerOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
                  aria-label="Quay lại"
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <div className="text-xs uppercase tracking-[0.35em] text-brand-gold">Play</div>
                  <div className="mt-1 text-lg font-semibold">Chơi ngay</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-8">
              <TruthOrDareGame cards={cards} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
