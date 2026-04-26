from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List


class LoginRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    reg_no: Optional[str] = None
    dob: Optional[date] = None
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    user_id: int
    branch_name: Optional[str] = None
    branch_code: Optional[str] = None
    must_change_password: Optional[bool] = False
    profile_image: Optional[str] = None


# ---------- Batch ----------
class BatchOut(BaseModel):
    id: int
    name: str
    start_year: int
    end_year: int
    current_semester: Optional[int] = None
    is_active: bool

    class Config:
        from_attributes = True


class BatchCreate(BaseModel):
    start_year: int
    end_year: int
    current_semester: Optional[int] = 1


class BatchUpdate(BaseModel):
    current_semester: Optional[int] = None
    is_active: Optional[bool] = None


# ---------- Branch ----------
class BranchOut(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        from_attributes = True


class BranchCreate(BaseModel):
    name: str
    code: str


class BranchUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None


# ---------- Admin ----------
class AdminCreate(BaseModel):
    email: str
    name: str
    branch_id: int
    phone: Optional[str] = None
    # password is auto-generated; optional manual override
    password: Optional[str] = None


class AdminUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    branch_id: Optional[int] = None
    is_active: Optional[bool] = None


class AdminOut(BaseModel):
    id: int
    email: str
    name: str
    phone: Optional[str]
    branch_id: int
    branch_name: Optional[str] = None
    branch_code: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class AdminCreateResponse(BaseModel):
    """Returned when creating a new branch admin — includes auto-password for super admin to share."""
    id: int
    email: str
    name: str
    branch_code: str
    default_password: str
    message: str


# ---------- Teacher ----------
class TeacherCreate(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None


class TeacherUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    profile_image: Optional[str] = None


class TeacherOut(BaseModel):
    id: int
    email: str
    name: str
    phone: Optional[str]
    is_active: bool
    is_verified: Optional[bool] = True
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True


class TeacherCreateResponse(BaseModel):
    id: int
    email: str
    name: str
    default_password: str
    message: str


# ---------- Student ----------
class StudentCreate(BaseModel):
    reg_no: str
    name: str
    date_of_birth: date
    batch_id: int
    current_semester: int
    student_type: str = "regular"
    phone: Optional[str] = None


class StudentUpdate(BaseModel):
    reg_no: Optional[str] = None
    name: Optional[str] = None
    date_of_birth: Optional[date] = None
    current_semester: Optional[int] = None
    student_type: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class StudentOut(BaseModel):
    id: int
    reg_no: str
    name: str
    batch_id: int
    current_semester: int
    student_type: str
    is_verified: Optional[bool] = True

    class Config:
        from_attributes = True


# ---------- Subject ----------
class SubjectCreate(BaseModel):
    code: str
    name: str
    batch_id: int
    semester: int
    teacher_id: int
    credits: Optional[int] = 3
    session: Optional[str] = None


class SubjectOut(BaseModel):
    id: int
    code: str
    name: str
    batch_id: int
    semester: int
    teacher_id: Optional[int]
    teacher_name: Optional[str] = None
    batch_name: Optional[str] = None
    credits: Optional[int] = 3
    session: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Attendance ----------
class AttendanceMark(BaseModel):
    subject_id: int
    class_date: date
    marks: List[dict]


class AttendanceEdit(BaseModel):
    """Used to back-date edit attendance"""
    subject_id: int
    class_date: date
    marks: List[dict]


# ---------- Password ----------
class PasswordChange(BaseModel):
    old_password: str
    new_password: str
