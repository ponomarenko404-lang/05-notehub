import axios from "axios";
import type { Note, NoteTag } from "../types/note";

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface FetchNotesParams {
  search?: string;
  page: number;
  perPage: number;
}

export interface CreateNoteData {
  title: string;
  content: string;
  tag: NoteTag;
}

const TOKEN = import.meta.env.VITE_NOTEHUB_TOKEN;
const BASE_URL = "https://notehub-public.goit.study/api";

const apiInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
});

export async function fetchNotes(
  params: FetchNotesParams,
): Promise<FetchNotesResponse> {
  const res = await apiInstance.get<FetchNotesResponse>("/notes", {
    params: {
      page: params.page,
      perPage: params.perPage,
      search: params.search || undefined,
    },
  });

  return res.data;
}

export async function createNote(paramsNote: CreateNoteData): Promise<Note> {
  const res = await apiInstance.post<Note>("/notes", paramsNote);

  return res.data;
}

export async function deleteNote(noteId: string): Promise<Note> {
  const res = await apiInstance.delete<Note>(`/notes/${noteId}`);
  return res.data;
}
