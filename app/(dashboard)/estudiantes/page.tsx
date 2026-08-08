"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { getStudents, createStudent, updateStudent, deleteStudent } from "@/services";
import { Student } from "@/types";

const statusVariantMap: Record<Student["status"], "success" | "danger" | "warning"> = {
  active: "success",
  inactive: "danger",
  pending: "warning",
};

const statusLabelMap: Record<Student["status"], string> = {
  active: "Activo",
  inactive: "Inactivo",
  pending: "Pendiente",
};

const gradeOptions = [
  { value: "", label: "Todos los niveles" },
  { value: "1er Grado", label: "1er Grado" },
  { value: "2do Grado", label: "2do Grado" },
  { value: "3er Grado", label: "3er Grado" },
  { value: "4to Grado", label: "4to Grado" },
  { value: "5to Grado", label: "5to Grado" },
  { value: "6to Grado", label: "6to Grado" },
];

export default function EstudiantesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    academic_level: "3er Grado",
    subjects: "", // se maneja como texto separado por comas en el formulario
    status: "active" as Student["status"],
    notes: "",
  });

  const load = () => getStudents().then(setStudents);

  useEffect(() => {
    load();
  }, []);

  const filtered = students.filter((s) => {
    const matchesSearch =
      search === "" || s.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesGrade = gradeFilter === "" || s.academic_level === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const openCreate = () => {
    setSelectedStudent(null);
    setForm({
      full_name: "",
      academic_level: "3er Grado",
      subjects: "",
      status: "active",
      notes: "",
    });
    setModalOpen(true);
  };

  const openEdit = (student: Student) => {
    setSelectedStudent(student);
    setForm({
      full_name: student.full_name,
      academic_level: student.academic_level,
      subjects: student.subjects.join(", "),
      status: student.status,
      notes: student.notes ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      full_name: form.full_name,
      academic_level: form.academic_level,
      subjects: form.subjects
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status: form.status,
      notes: form.notes || null,
      avatar_url: null,
    };

    if (selectedStudent) {
      await updateStudent(selectedStudent.id, payload);
    } else {
      await createStudent(payload);
    }
    setModalOpen(false);
    load();
  };

  const openDeleteConfirm = (student: Student) => {
    setDeleteError("");
    setDeleteTarget(student);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError("");
    try {
      await deleteStudent(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo eliminar el alumno");
    }
  };

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "grade", label: "Nivel" },
    { key: "subjects", label: "Materias" },
    { key: "status", label: "Estado" },
    { key: "actions", label: "" },
  ];

  const tableData = filtered.map((s) => ({
    id: s.id,
    name: <p className="font-medium text-primary">{s.full_name}</p>,
    grade: <span className="text-sm">{s.academic_level}</span>,
    subjects: <span className="text-sm text-muted">{s.subjects.join(", ") || "—"}</span>,
    status: (
      <Badge variant={statusVariantMap[s.status]}>
        {statusLabelMap[s.status]}
      </Badge>
    ),
    actions: (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(s); }}>
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); openDeleteConfirm(s); }}
          className="text-danger hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Estudiantes</h2>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Nuevo Estudiante
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Select
            options={gradeOptions}
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="sm:w-48"
          />
        </div>

        <Table
          columns={columns}
          data={tableData}
          emptyMessage="No se encontraron estudiantes"
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedStudent ? "Editar Estudiante" : "Nuevo Estudiante"}
      >
        <div className="space-y-4">
          <Input
            id="full_name"
            label="Nombre completo"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
          <Select
            id="grade"
            label="Nivel académico"
            options={gradeOptions.filter((g) => g.value !== "")}
            value={form.academic_level}
            onChange={(e) => setForm({ ...form, academic_level: e.target.value })}
          />
          <Input
            id="subjects"
            label="Materias (separadas por comas)"
            placeholder="Matemáticas, Ciencias, Inglés"
            value={form.subjects}
            onChange={(e) => setForm({ ...form, subjects: e.target.value })}
          />
          <Select
            id="status"
            label="Estado"
            options={[
              { value: "active", label: "Activo" },
              { value: "pending", label: "Pendiente" },
              { value: "inactive", label: "Inactivo" },
            ]}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Student["status"] })}
          />
          <Input
            id="notes"
            label="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {selectedStudent ? "Guardar Cambios" : "Crear Estudiante"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar Estudiante"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm">
              ¿Seguro que quieres eliminar a{" "}
              <span className="font-semibold">{deleteTarget.full_name}</span>? Esta acción no se puede deshacer.
            </p>
            {deleteError && (
              <p className="text-sm text-danger text-center bg-red-50 rounded-lg py-2">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}