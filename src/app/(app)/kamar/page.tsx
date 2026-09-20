"use client";

import { useEffect, useState } from "react";
import { IconBed, IconPencil, IconTrash } from "@tabler/icons-react";

import {
  SuperadminGate,
  useSuperadmin,
} from "~/app/_components/superadmin-gate";
import {
  Button,
  closeModal,
  errMsg,
  inputClass,
  Modal,
  PageHeader,
  refreshOverlays,
  Spinner,
  Toast,
  useToast,
} from "~/app/_components/ui";
import { api } from "~/trpc/react";

function IconBtn({
  children,
  label,
  onClick,
  danger,
  ...rest
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  [key: string]: unknown;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      {...rest}
      className={`flex size-9 items-center justify-center rounded-xl text-sm transition disabled:opacity-30 ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "border-border text-muted-foreground hover:bg-muted-hover border"
      }`}
    >
      {children}
    </button>
  );
}

function RoomsPage() {
  const list = api.room.list.useQuery();
  const create = api.room.create.useMutation();
  const updateName = api.room.updateName.useMutation();
  const remove = api.room.remove.useMutation();
  const utils = api.useUtils();

  const { toast, setToast } = useToast();
  const [name, setName] = useState("");
  const [editRoom, setEditRoom] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [removeRoom, setRemoveRoom] = useState<{
    id: string;
    name: string;
    memberCount: number;
  } | null>(null);

  useEffect(() => {
    if (list.data) refreshOverlays();
  }, [list.data]);

  function refresh() {
    void utils.room.list.invalidate();
    void utils.member.list.invalidate();
    void utils.schedule.current.invalidate();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({ name });
      setName("");
      refresh();
    } catch (err) {
      setToast({ message: errMsg(err, "Gagal nambah kamar."), kind: "error" });
    }
  }

  const rooms = list.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kamar"
        subtitle={`${rooms.length} kamar · dipakai buat pengelompokan anggota`}
      />

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className={inputClass}
          placeholder="Nama kamar, mis. 2A"
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
      ) : rooms.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line-3 bg-card p-8 text-center">
          <p
            className="bg-primary-100 mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl text-xl"
            aria-hidden="true"
          >
            <IconBed size={26} stroke={1.75} />
          </p>
          <p className="mx-auto max-w-xs text-sm text-muted-foreground">
            Belum ada kamar. Tambahin dulu biar pas isi anggota tinggal milih,
            misal: 2A, 2B, 3A.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rooms.map((r) => (
            <li
              key={r.id}
              className="border-border bg-card flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 shadow-sm sm:px-4"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                  aria-hidden="true"
                >
                  {r.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                  {r.name}
                </span>
                <span className="text-muted-foreground shrink-0 rounded-full bg-muted/70 px-2 py-0.5 text-xs">
                  {r._count.members} orang
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <IconBtn
                  label="Ubah nama"
                  onClick={() => {
                    setEditRoom(r.id);
                    setEditName(r.name);
                  }}
                  data-hs-overlay="#modal-room-edit"
                >
                  <IconPencil size={16} aria-hidden="true" />
                </IconBtn>
                <IconBtn
                  label="Hapus"
                  danger
                  onClick={() =>
                    setRemoveRoom({
                      id: r.id,
                      name: r.name,
                      memberCount: r._count.members,
                    })
                  }
                  data-hs-overlay="#modal-room-remove"
                >
                  <IconTrash size={16} aria-hidden="true" />
                </IconBtn>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Toast toast={toast} />

      <Modal id="modal-room-edit" title="Ubah nama kamar">
        <input
          className={inputClass}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && editRoom) {
              updateName.mutate(
                { id: editRoom, name: editName.trim() },
                {
                  onSuccess: () => {
                    closeModal("modal-room-edit");
                    refresh();
                  },
                  onError: (err) =>
                    setToast({ message: err.message, kind: "error" }),
                },
              );
            }
          }}
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button kind="ghost" data-hs-overlay="#modal-room-edit">
            Batal
          </Button>
          <Button
            disabled={
              updateName.isPending ||
              !editName.trim() ||
              editName.trim() === (list.data?.find((r) => r.id === editRoom)?.name ?? "")
            }
            onClick={() =>
              updateName.mutate(
                { id: editRoom!, name: editName.trim() },
                {
                  onSuccess: () => {
                    closeModal("modal-room-edit");
                    refresh();
                  },
                  onError: (err) =>
                    setToast({ message: err.message, kind: "error" }),
                },
              )
            }
          >
            Simpan
          </Button>
        </div>
      </Modal>

      <Modal id="modal-room-remove" title={`Hapus kamar ${removeRoom?.name ?? ""}?`}>
        <p className="text-sm text-muted-foreground">
          {removeRoom && removeRoom.memberCount > 0
            ? `${removeRoom.memberCount} orang di kamar ini bakal lepas kamarnya (anggota tetap ada).`
            : "Kamar bakal hilang dari daftar."}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button kind="ghost" data-hs-overlay="#modal-room-remove">
            Batal
          </Button>
          <Button
            kind="danger"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(
                { id: removeRoom!.id },
                {
                  onSuccess: () => {
                    closeModal("modal-room-remove");
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

export default function KamarPage() {
  const { orgName } = useSuperadmin();

  return (
    <SuperadminGate>
      <div className="space-y-1">
        {orgName && (
          <p className="text-primary-700 text-xs font-bold tracking-wide uppercase">
            {orgName}
          </p>
        )}
        <RoomsPage />
      </div>
    </SuperadminGate>
  );
}