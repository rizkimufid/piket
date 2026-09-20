"use client";

import { useState } from "react";

import {
  SuperadminGate,
  useSuperadmin,
} from "~/app/_components/superadmin-gate";
import {
  Button,
  errMsg,
  inputClass,
  Modal,
  PageHeader,
  Spinner,
  Toast,
  useToast,
} from "~/app/_components/ui";
import { api } from "~/trpc/react";

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex size-9 items-center justify-center rounded-xl text-sm transition disabled:opacity-30 ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function TasksPage() {
  const list = api.task.list.useQuery();
  const create = api.task.create.useMutation();
  const updateName = api.task.updateName.useMutation();
  const move = api.task.move.useMutation();
  const remove = api.task.remove.useMutation();
  const utils = api.useUtils();

  const { toast, setToast } = useToast();
  const [name, setName] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);

  function refresh() {
    void utils.task.list.invalidate();
    void utils.schedule.current.invalidate();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({ name });
      setName("");
      refresh();
    } catch (err) {
      setToast({ message: errMsg(err, "Gagal nambah task."), kind: "error" });
    }
  }

  const tasks = list.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Task piket"
        subtitle={`${tasks.length} task · urutan dipakai buat pembagian jadwal`}
      />

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className={inputClass}
          placeholder="Nama task, mis. Ngepel"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" disabled={create.isPending || !name.trim()}>
          Tambah
        </Button>
      </form>

      {list.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p
            className="bg-brand-100 mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl text-xl"
            aria-hidden="true"
          >
            🧹
          </p>
          <p className="mx-auto max-w-xs text-sm text-gray-600">
            Belum ada task piket. Tambahin dulu, misal: menyapu, ngepel, kamar
            mandi.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t, i) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200/70 bg-white px-3 py-3 shadow-sm sm:px-4"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-bold text-gray-500"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 truncate text-sm font-semibold text-gray-800">
                  {t.name}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <IconBtn
                  label="Naik"
                  disabled={i === 0}
                  onClick={() =>
                    move.mutate({ id: t.id, dir: "up" }, { onSuccess: refresh })
                  }
                >
                  ↑
                </IconBtn>
                <IconBtn
                  label="Turun"
                  disabled={i === tasks.length - 1}
                  onClick={() =>
                    move.mutate(
                      { id: t.id, dir: "down" },
                      { onSuccess: refresh },
                    )
                  }
                >
                  ↓
                </IconBtn>
                <IconBtn
                  label="Ubah nama"
                  onClick={() => {
                    const next = window.prompt("Nama task baru:", t.name);
                    if (next?.trim()) {
                      updateName.mutate(
                        { id: t.id, name: next.trim() },
                        {
                          onSuccess: refresh,
                          onError: (e) =>
                            setToast({ message: e.message, kind: "error" }),
                        },
                      );
                    }
                  }}
                >
                  ✎
                </IconBtn>
                <IconBtn label="Hapus" danger onClick={() => setRemoveId(t.id)}>
                  🗑
                </IconBtn>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Toast toast={toast} />

      <Modal
        open={!!removeId}
        onClose={() => setRemoveId(null)}
        title="Hapus task ini?"
      >
        <p className="text-sm text-gray-600">
          Task bakal hilang dari daftar piket.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setRemoveId(null)}>
            Batal
          </Button>
          <Button
            kind="danger"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(
                { id: removeId! },
                {
                  onSuccess: () => {
                    setRemoveId(null);
                    refresh();
                  },
                  onError: (err) =>
                    setToast({ message: err.message, kind: "error" }),
                },
              )
            }
          >
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function TaskPage() {
  const { orgName } = useSuperadmin();

  return (
    <SuperadminGate>
      <div className="space-y-1">
        {orgName && (
          <p className="text-brand-700 text-xs font-bold tracking-wide uppercase">
            {orgName}
          </p>
        )}
        <TasksPage />
      </div>
    </SuperadminGate>
  );
}
