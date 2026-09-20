"use client";

import { useEffect, useState } from "react";
import { IconBed, IconKey, IconPencil, IconTrash } from "@tabler/icons-react";

import {
  SuperadminGate,
  useSuperadmin,
} from "~/app/_components/superadmin-gate";
import {
  Button,
  Chip,
  closeModal,
  errMsg,
  Field,
  inputClass,
  Modal,
  openModal,
  PageHeader,
  refreshOverlays,
  Spinner,
  Toast,
  useToast,
} from "~/app/_components/ui";
import { api } from "~/trpc/react";

type TempPassword = { title: string; email: string; tempPassword: string };

function ResetCard({ data }: { data: TempPassword }) {
  return (
    <div className="border-primary-200 bg-primary-50 rounded-2xl border p-4 text-center">
      <p className="text-sm text-foreground">
        {data.title} untuk <strong>{data.email}</strong>:
      </p>
      <p className="text-primary-700 mt-2 rounded-xl bg-card px-3 py-2 font-mono text-2xl font-bold tracking-widest select-all">
        {data.tempPassword}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Salin terus kasih ke yang bersangkutan. Pas masuk, mereka bakal dipaksa
        ganti sandi.
      </p>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="bg-primary-100 text-primary-700 flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function MembersPage() {
  const list = api.member.list.useQuery();
  const rooms = api.room.list.useQuery();
  const create = api.auth.createMember.useMutation();
  const update = api.member.update.useMutation();
  const remove = api.member.remove.useMutation();
  const reset = api.auth.resetPassword.useMutation();
  const utils = api.useUtils();

  const { toast, setToast } = useToast();
  const [editOpen, setEditOpen] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [temp, setTemp] = useState<TempPassword | null>(null);

  useEffect(() => {
    if (list.data || rooms.data) refreshOverlays();
  }, [list.data, rooms.data]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");

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
        roomId: roomId || undefined,
      });
      setTemp({
        title: "Sandi sementara",
        email: res.email,
        tempPassword: res.tempPassword,
      });
      closeModal("modal-member-add");
      openModal("modal-member-temp");
      setName("");
      setEmail("");
      setRoomId("");
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
          <Button type="button" data-hs-overlay="#modal-member-add">
            + Tambah
          </Button>
        }
      />

      {list.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line-3 bg-card p-8 text-center">
          <p
            className="bg-primary-100 mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl text-xl"
            aria-hidden="true"
          >
            <IconBed size={26} stroke={1.75} />
          </p>
          <p className="text-sm text-muted-foreground">
            Masih kosong nih. Tambahin penghuni pertama biar piketnya jalan.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="border-border bg-card flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 shadow-sm sm:px-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={m.user.name} />
                <div className="min-w-0">
                  <p className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm font-bold text-foreground">
                    <span className="truncate">{m.user.name}</span>
                    {m.role === "SUPERADMIN" && (
                      <Chip tone="brand">superadmin</Chip>
                    )}
                    {!m.isActive && <Chip tone="neutral">libur</Chip>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.user.email}
                    {m.room ? ` · kamar ${m.room.name}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  kind="ghost"
                  className="px-2 py-1.5 sm:px-2.5 sm:text-xs"
                  onClick={() => setEditOpen(m.id)}
                  data-hs-overlay="#modal-member-edit"
                  aria-label={`Edit ${m.user.name}`}
                >
                  <IconPencil size={16} className="sm:mr-1" aria-hidden="true" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  kind="ghost"
                  className="px-2 py-1.5 sm:px-2.5 sm:text-xs"
                  onClick={() =>
                    reset.mutate(
                      { membershipId: m.id },
                      {
                        onSuccess: (res) => {
                          setTemp({
                            title: "Sandi baru",
                            email: res.email,
                            tempPassword: res.tempPassword,
                          });
                          openModal("modal-member-temp");
                        },
                        onError: (err) =>
                          setToast({ message: err.message, kind: "error" }),
                      },
                    )
                  }
                  disabled={m.role === "SUPERADMIN"}
                  aria-label={`Reset sandi ${m.user.name}`}
                >
                  <IconKey size={16} className="sm:mr-1" aria-hidden="true" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
                <Button
                  kind="ghost"
                  className="px-2 py-1.5 text-red-600 hover:border-red-200 hover:bg-red-50 sm:px-2.5 sm:text-xs"
                  onClick={() => setRemoveId(m.id)}
                  data-hs-overlay="#modal-member-remove"
                  disabled={m.role === "SUPERADMIN"}
                  aria-label={`Hapus ${m.user.name}`}
                >
                  <IconTrash size={16} className="sm:mr-1" aria-hidden="true" />
                  <span className="hidden sm:inline">Hapus</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Toast toast={toast} />

      <Modal id="modal-member-add" title="Tambah anggota">
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
            <select
              className={inputClass}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="">Nggak usah dulu</option>
              {rooms.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Menyimpan..." : "Tambahkan"}
          </Button>
        </form>
      </Modal>

      <Modal id="modal-member-edit" title={`Edit ${editing?.user.name ?? ""}`}>
        {editing && (
          <EditMemberForm
            key={editing.id}
            initialName={editing.user.name}
            initialRoomId={editing.room?.id ?? ""}
            isActive={editing.isActive}
            rooms={rooms.data ?? []}
            onSubmit={async ({ name: n, roomId: rid, isActive }) => {
              await update.mutateAsync({
                membershipId: editing.id,
                name: n,
                roomId: rid || null,
                isActive,
              });
              closeModal("modal-member-edit");
              refresh();
              setToast({ message: "Beres nih. Anggota ke-update." });
            }}
            onError={(msg) => setToast({ message: msg, kind: "error" })}
          />
        )}
      </Modal>

      <Modal id="modal-member-temp" title="Sandi dibikin, gas!">
        {temp && <ResetCard data={temp} />}
      </Modal>

      <Modal id="modal-member-remove" title="Yakin hapus anggota?">
        <p className="text-sm text-muted-foreground">
          Anggota keluar dari rotasi piket. Nggak bisa dibatalkan.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button kind="ghost" data-hs-overlay="#modal-member-remove">
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
                    closeModal("modal-member-remove");
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
  initialRoomId,
  isActive,
  rooms,
  onSubmit,
  onError,
}: {
  initialName: string;
  initialRoomId: string;
  isActive: boolean;
  rooms: { id: string; name: string }[];
  onSubmit: (v: {
    name: string;
    roomId: string;
    isActive: boolean;
  }) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [roomId, setRoomId] = useState(initialRoomId);
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ name, roomId, isActive: active });
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
        <select
          className={inputClass}
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        >
          <option value="">Nggak ada kamar</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
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
          <p className="text-primary-700 text-xs font-bold tracking-wide uppercase">
            {orgName}
          </p>
        )}
        <MembersPage />
      </div>
    </SuperadminGate>
  );
}
