import { useState } from "react";
import css from "./App.module.css";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useDebouncedCallback } from "use-debounce";

import { fetchNotes, deleteNote, createNote } from "../../services/noteService";

import type { CreateNoteData } from "../../services/noteService";

import NoteList from "../NoteList/NoteList";
import Pagination from "../Pagination/Pagination";
import SearchBox from "../SearchBox/SearchBox";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";

function App() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", page, query],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: 12,
        search: query,
      }),
    placeholderData: keepPreviousData,
  });

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleSearch = useDebouncedCallback((value: string) => {
    setQuery(value);
    setPage(1);
  }, 500);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    handleSearch(value);
  };

  // 🧨 DELETE MUTATION (з loading state)
  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
    },
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);

    deleteMutation.mutate(id, {
      onSettled: () => {
        setDeletingId(null);
      },
    });
  };

  // ✨ CREATE MUTATION
  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
      closeModal();
    },
  });

  const handleCreateNote = (values: CreateNoteData) => {
    createMutation.mutate(values);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading notes</p>;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={inputValue} onChange={handleInputChange} />

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

        <button className={css.button} onClick={openModal}>
          Create note +
        </button>
      </header>

      {/* NOTES */}
      {notes.length > 0 && (
        <NoteList
          notes={notes}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      {notes.length === 0 && <p>No notes found</p>}

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <NoteForm onClose={closeModal} onSubmit={handleCreateNote} />
      </Modal>
    </div>
  );
}

export default App;
