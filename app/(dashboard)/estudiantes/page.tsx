"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { getStudents, createStudent, updateStudent } from "@/services";
import { Student } from "@/types";

const statusVariantMap: Record<Student["status"], "success" | "danger" | "warning"> = {
  active: "success",
  inactive: "danger",
  suspended: "warning",
};

const statusLabelMap: Record<Student["status"], string> = {
  active: "Activo",
  inactive: "Inactivo",
  suspended: "Suspendido",
};

const gradeOptions = [
  { value: "", label: "Todos los grados" },
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
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birth_date: "",
    group_or_grade: "3er Grado",
    status: "active" as Student["status"],
  });

  useEffect(() => {
    getStudents().then(setStudents);
  }, []);

  const filtered = students.filter((s) => {
    const matchesSearch =
      search === "" ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase());
    const matchesGrade = gradeFilter === "" || s.group_or_grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const openCreate = () => {
    setSelectedStudent(null);
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      birth_date: "",
      group_or_grade: "3er Grado",
      status: "active",
    });
    setModalOpen(true);
  };

  const openEdit = (student: Student) => {
    setSelectedStudent(student);
    setForm({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone: student.phone,
      birth_date: student.birth_date,
      group_or_grade: student.group_or_grade,
      status: student.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (selectedStudent) {
      await updateStudent(selectedStudent.id, form);
    } else {
      await createStudent(form);
    }
    setModalOpen(false);
    getStudents().then(setStudents);
  };

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "grade", label: "Grado" },
    { key: "phone", label: "Teléfono" },
    { key: "status", label: "Estado" },
    { key: "actions", label: "" },
  ];

  const tableData = filtered.map((s) => ({
    id: s.id,
    name: (
      <div>
        <p className="font-medium text-primary">
          {s.first_name} {s.last_name}
        </p>
        <p className="text-xs text-muted">{s.email}</p>
      </div>
    ),
    grade: <span className="text-sm">{s.group_or_grade}</span>,
    phone: <span className="text-sm text-muted">{s.phone}</span>,
    status: (
      <Badge variant={statusVariantMap[s.status]}>
        {statusLabelMap[s.status]}
      </Badge>
    ),
    actions: (
      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(s); }}>
        Editar
      </Button>
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="first_name"
              label="Nombre"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              required
            />
            <Input
              id="last_name"
              label="Apellido"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              required
            />
          </div>
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            id="phone"
            label="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            id="birth_date"
            label="Fecha de nacimiento"
            type="date"
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
          />
          <Select
            id="grade"
            label="Grado"
            options={gradeOptions.filter((g) => g.value !== "")}
            value={form.group_or_grade}
            onChange={(e) => setForm({ ...form, group_or_grade: e.target.value })}
          />
          <Select
            id="status"
            label="Estado"
            options={[
              { value: "active", label: "Activo" },
              { value: "inactive", label: "Inactivo" },
              { value: "suspended", label: "Suspendido" },
            ]}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Student["status"] })}
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
    </div>
  );
}