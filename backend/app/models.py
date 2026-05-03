from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Branch(Base):
    __tablename__ = "branches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)


class SuperAdmin(Base):
    __tablename__ = "super_admins"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    phone = Column(String)
    is_active = Column(Boolean, default=True)
    password_changed = Column(Boolean, default=False)   # default False — force change on first login
    created_at = Column(DateTime, default=datetime.utcnow)
    branch = relationship("Branch")


class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String)
    # branch_id = "primary"/"home" branch (the one the teacher was first added to).
    # Cross-branch teaching is tracked via the TeacherBranch many-to-many table.
    branch_id = Column(Integer, ForeignKey("branches.id"))
    created_by_admin_id = Column(Integer, ForeignKey("admins.id"))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    password_changed = Column(Boolean, default=False)
    profile_image = Column(String, nullable=True)     # filename/URL
    created_at = Column(DateTime, default=datetime.utcnow)
    branch = relationship("Branch")


class TeacherBranch(Base):
    """Many-to-many link: same teacher can teach in multiple branches.
    Created automatically when a HOD adds an existing teacher (by email)
    to their own branch — no duplicate user, no second credentials email."""
    __tablename__ = "teacher_branches"
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    __table_args__ = (UniqueConstraint("teacher_id", "branch_id"),)


class Batch(Base):
    __tablename__ = "batches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    start_year = Column(Integer, nullable=False)
    end_year = Column(Integer, nullable=False)
    current_semester = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    reg_no = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    batch_id = Column(Integer, ForeignKey("batches.id"))
    current_semester = Column(Integer)
    student_type = Column(String, default="regular")
    phone = Column(String)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    branch = relationship("Branch")
    batch = relationship("Batch")


class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    batch_id = Column(Integer, ForeignKey("batches.id"))
    semester = Column(Integer, nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    credits = Column(Integer, default=3)                  # NEW — credits per subject
    session = Column(String, nullable=True)               # NEW — e.g. "2025-26"
    branch = relationship("Branch")
    batch = relationship("Batch")
    teacher = relationship("Teacher")


class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    __table_args__ = (UniqueConstraint("student_id", "subject_id"),)


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    class_date = Column(Date, nullable=False)
    status = Column(String, nullable=False)
    marked_by_teacher_id = Column(Integer, ForeignKey("teachers.id"))
    marked_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("student_id", "subject_id", "class_date"),)
