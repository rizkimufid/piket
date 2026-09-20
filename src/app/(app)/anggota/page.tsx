"use client";

import { useState } from "react";

import {
  SuperadminGate,
  useSuperadmin,
} from "~/app/_components/superadmin-gate";
import {
  Button,
  Chip,
  errMsg,
  Field,
  inputClass,
  Modal,
  PageHeader,
  Spinner,
  Toast,
  useToast,
} from "~/app/_components/ui";
import { api } from "~/trpc/react";

type TempPassword = { title: string; email: string; tempPassword: string };

function ResetCard({ data }: { data: TempPassword }) {
  return (
    <div className="border-brand-200 bg-brand-50 rounded-2xl border p-4 text-center">
      <p className="text-sm text-gray-700">
        {data.title} untuk <strong>{data.email}</strong>:
      </p>
      <p className="text-brand-700 mt-2 rounded-xl bg-white px-3 py-2 font-mono text-2xl font-bold tracking-widest select-all">
        {data.tempPassword}
      </p>
      <p className="mt-2 text-xs text-gray-500">
        Salin terus kasih ke yang bersangkutan. Pas masuk, mereka bakal dipaksa
        ganti sandi.
      </p>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="bg-brand-100 text-brand-700 flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function MembersPage() {
  const list = api.member.list.useQuery();
  const create = api.auth.createMember.useMutation();
  const update = api.member.update.useMutation();
  const remove = api.member.remove.useMutation();
  const reset = api.auth.resetPassword.useMutation();
  const utils = api.useUtils();

  const { toast, setToast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [temp, setTemp] = useState<TempPassword | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kamar, setKamar] = useState("");

  function refresh() {
    void utils.member.list.invalidate();
    void utils.task.list.invalidate();
    void utils.schedule.current.invalidate();
  }

  const editing = editOpen ? list.data?.find((m) => m.id === editOpen) : null;

  async function onSubmitAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await create.mutateAsync({
        name,
        email,
        kamar: kamar || undefined,
      });
      setTemp({
        title: "Sandi sementara",
        email: res.email,
        tempPassword: res.tempPassword,
      });
      setAddOpen(false);
      setName("");
      setEmail("");
      setKamar("");
      refresh();
    } catch (err) {
      setToast({
        message: errMsg(err, "Gagal nambah anggota."),
        kind: "error",
      });
    }
  }

  const members = list.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Anggota"
        subtitle={`${members.length} orang · ${members.filter((m) => m.isActive).length} ikut piket`}
        action={
          <Button type="button" onClick={() => setAddOpen(true)}>
            + Tambah
          </Button>
        }
      />

      {list.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p
            className="bg-brand-100 mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl text-xl"
            aria-hidden="true"
          >
            🛌
          </p>
          <p className="text-sm text-gray-600">
            Masih kosong nih. Tambahin penghuni pertama biar piketnya jalan.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200/70 bg-white px-3 py-3 shadow-sm sm:px-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={m.user.name} />
                <div className="min-w-0">
                  <p className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm font-bold text-gray-800">
                    <span className="truncate">{m.user.name}</span>
                    {m.role === "SUPERADMIN" && (
                      <Chip tone="brand">superadmin</Chip>
                    )}
                    {!m.isActive && <Chip tone="neutral">libur</Chip>}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {m.user.email}
                    {m.kamar ? ` · kamar ${m.kamar}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  kind="ghost"
                  className="px-2.5 py-1.5 text-xs"
                  onClick={() => setEditOpen(m.id)}
                >
                  Edit
                </Button>
                <Button
                  kind="ghost"
                  className="px-2.5 py-1.5 text-xs"
                  onClick={() =>
                    reset.mutate(
                      { membershipId: m.id },
                      {
                        onSuccess: (res) =>
                          setTemp({
                            title: "Sandi baru",
                            email: res.email,
                            tempPassword: res.tempPassword,
                          }),
                        onError: (err) =>
                          setToast({ message: err.message, kind: "error" }),
                      },
                    )
                  }
                  disabled={m.role === "SUPERADMIN"}
                >
                  Reset
                </Button>
                <Button
                  kind="ghost"
                  className="px-2.5 py-1.5 text-xs text-red-600 hover:border-red-200 hover:bg-red-50"
                  onClick={() => setRemoveId(m.id)}
                  disabled={m.role === "SUPERADMIN"}
                >
                  Hapus
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Toast toast={toast} />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah anggota"
      >
        <form onSubmit={onSubmitAdd} className="space-y-4">
          <Field label="Nama">
            <input
              required
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Rizki"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </Field>
          <Field label="Kamar (opsional)">
            <input
              className={inputClass}
              value={kamar}
              onChange={(e) => setKamar(e.target.value)}
              placeholder="Misal: 2B"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Menyimpan..." : "Tambahkan"}
          </Button>
        </form>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditOpen(null)}
        title={`Edit ${editing?.user.name ?? ""}`}
      >
        {editing && (
          <EditMemberForm
            key={editing.id}
            initialName={editing.user.name}
            initialKamar={editing.kamar ?? ""}
            isActive={editing.isActive}
            onSubmit={async ({ name: n, kamar: k, isActive }) => {
              await update.mutateAsync({
                membershipId: editing.id,
                name: n,
                kamar: k || undefined,
                isActive,
              });
              setEditOpen(null);
              refresh();
              setToast({ message: "Beres nih. Anggota ke-update." });
            }}
            onError={(msg) => setToast({ message: msg, kind: "error" })}
          />
        )}
      </Modal>

      <Modal
        open={!!temp}
        onClose={() => setTemp(null)}
        title="Sandi dibikin, gas!"
      >
        {temp && <ResetCard data={temp} />}
      </Modal>

      <Modal
        open={!!removeId}
        onClose={() => setRemoveId(null)}
        title="Yakin hapus anggota?"
      >
        <p className="text-sm text-gray-600">
          Anggota keluar dari rotasi piket. Nggak bisa dibatalkan.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setRemoveId(null)}>
            Batal
          </Button>
          <Button
            kind="danger"
            onClick={() => {
              if (!removeId) return;
              remove.mutate(
                { membershipId: removeId },
                {
                  onSuccess: () => {
                    setRemoveId(null);
                    refresh();
                    setToast({ message: "Anggota udah dihapus." });
                  },
                  onError: (err) =>
                    setToast({ message: err.message, kind: "error" }),
                },
              );
            }}
            disabled={remove.isPending}
          >
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function EditMemberForm({
  initialName,
  initialKamar,
  isActive,
  onSubmit,
  onError,
}: {
  initialName: string;
  initialKamar: string;
  isActive: boolean;
  onSubmit: (v: {
    name: string;
    kamar: string;
    isActive: boolean;
  }) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [kamar, setKamar] = useState(initialKamar);
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ name, kamar, isActive: active });
    } catch (err) {
      onError(errMsg(err, "Gagal menyimpan."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nama">
        <input
          required
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="Kamar">
        <input
          className={inputClass}
          value={kamar}
          onChange={(e) => setKamar(e.target.value)}
        />
      </Field>
      <Field label="Status">
        <select
          className={inputClass}
          value={active ? "aktif" : "libur"}
          onChange={(e) => setActive(e.target.value === "aktif")}
        >
          <option value="aktif">Aktif — ikut piket</option>
          <option value="libur">Libur — gaikut rotasi</option>
        </select>
      </Field>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}

export default function AnggotaPage() {
  const { orgName } = useSuperadmin();

  return (
    <SuperadminGate>
      <div className="space-y-1">
        {orgName && (
          <p className="text-brand-700 text-xs font-bold tracking-wide uppercase">
            {orgName}
          </p>
        )}
        <MembersPage />
      </div>
    </SuperadminGate>
  );
}
