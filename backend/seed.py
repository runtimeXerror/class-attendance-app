"""
Seed script for Class Attendance System v1.1
Creates: Super Admin (Vishal), 6 Branches, 4 Batches,
Full student rosters + 5th Sem subjects + teachers for all 6 branches:
  - CSE (Computer Science and Engineering)
  - CSE-DS (CSE - Data Science)
  - CE (Civil Engineering)
  - CHE (Chemical Engineering)
  - EEE (Electrical and Electronics Engineering)
  - ME (Mechanical Engineering)
"""
from app.database import SessionLocal, engine, Base
from app import models, auth
from datetime import date

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("Seeding database...")

# =========================
# RESET
# =========================
db.query(models.AttendanceRecord).delete()
db.query(models.Enrollment).delete()
db.query(models.Subject).delete()
db.query(models.Student).delete()
db.query(models.Teacher).delete()
db.query(models.Admin).delete()
db.query(models.SuperAdmin).delete()
db.query(models.Batch).delete()
db.query(models.Branch).delete()
db.commit()

# =========================
# 1. SUPER ADMIN
# =========================
sa = models.SuperAdmin(
    email="vishal@rrsdce.edu",
    password_hash=auth.hash_password("vishal123"),
    name="Vishal Kumar",
)
db.add(sa)
db.commit()
print(f"✓ Super Admin: {sa.email} / vishal123")

# =========================
# 2. BRANCHES (6)
# =========================
branches_data = [
    ("Computer Science and Engineering", "CSE"),
    ("CSE - Data Science", "CSE-DS"),
    ("Civil Engineering", "CE"),
    ("Chemical Engineering", "CHE"),
    ("Electrical and Electronics Engineering", "EEE"),
    ("Mechanical Engineering", "ME"),
]
branches = {}
for name, code in branches_data:
    b = models.Branch(name=name, code=code)
    db.add(b)
    branches[code] = b
db.commit()
for b in branches.values():
    db.refresh(b)
print(f"✓ Created {len(branches)} branches")

# =========================
# 3. BATCHES (4)
# =========================
batches_data = [
    (2022, 2026, 8),
    (2023, 2027, 5),
    (2024, 2028, 3),
    (2025, 2029, 1),
]
batches = {}
for start, end, cur_sem in batches_data:
    name = f"{start}-{str(end)[-2:]}"
    b = models.Batch(name=name, start_year=start, end_year=end, current_semester=cur_sem)
    db.add(b)
    batches[name] = b
db.commit()
for b in batches.values():
    db.refresh(b)
print(f"✓ Created {len(batches)} batches")

# =========================
# 4. BRANCH ADMINS (6)
# =========================
admins = {}
admin_info = [
    ("CSE",    "cse.admin@rrsdce.edu",    "Ramesh Kumar (CSE HOD)",    "9876543210"),
    ("CSE-DS", "csds.admin@rrsdce.edu",   "Ritesh Kumar (CSE-DS HOD)", "9876543220"),
    ("CE",     "ce.admin@rrsdce.edu",     "Manoj Kumar (CE HOD)",      "9876543230"),
    ("CHE",    "che.admin@rrsdce.edu",    "Rajesh Kumar (CHE HOD)",    "9876543240"),
    ("EEE",    "eee.admin@rrsdce.edu",    "Dinesh Kumar (EEE HOD)",    "9876543250"),
    ("ME",     "me.admin@rrsdce.edu",     "Sanjay Kumar (ME HOD)",     "9876543260"),
]
for code, email, name, phone in admin_info:
    a = models.Admin(
        email=email,
        password_hash=auth.hash_password("admin123"),
        name=name,
        branch_id=branches[code].id,
        phone=phone,
        password_changed=True,   # seed admins don't need first-login password change
    )
    db.add(a)
    admins[code] = a
db.commit()
for a in admins.values():
    db.refresh(a)
print(f"✓ Created {len(admins)} branch HODs")

# =========================
# 5. TEACHERS (from actual PDFs/time-tables)
# =========================
teachers_data = {
    # ---- CSE ----
    "CSE:RKR":  ("rajiv.ranjan@rrsdce.edu",     "Prof. Rajiv Kumar Ranjan",     "CSE", "9811100001"),
    "CSE:AS":   ("ankita.sinha@rrsdce.edu",     "Dr. Ankita Sinha",             "CSE", "9811100002"),
    "CSE:SS":   ("sankalp.sonu@rrsdce.edu",     "Prof. Sankalp Sonu",           "CSE", "9811100003"),
    "CSE:RR":   ("rakesh.roshan@rrsdce.edu",    "Prof. Rakesh Kumar Roshan",    "CSE", "9811100004"),
    "CSE:MAA":  ("arshad.ali@rrsdce.edu",       "Prof. Md Arshad Ali",          "CSE", "9811100005"),
    "CSE:AKJ":  ("abhishek.jha@rrsdce.edu",     "Prof. Abhishek Kumar Jha",     "CSE", "9811100006"),

    # ---- CSE-DS ----
    "DS:MDA":   ("md.arshad.ali.ds@rrsdce.edu", "Prof. Md Arshad Ali",          "CSE-DS", "9811200001"),
    "DS:AK":    ("annu.kumari@rrsdce.edu",      "Prof. Annu Kumari",            "CSE-DS", "9811200002"),
    "DS:SNS":   ("shyam.shukla@rrsdce.edu",     "Prof. Shyam Nandan Shukla",    "CSE-DS", "9811200003"),
    "DS:RKR":   ("ravi.kumar@rrsdce.edu",       "Prof. Ravi Kumar",             "CSE-DS", "9811200004"),
    "DS:SS":    ("sankalp.sonu.ds@rrsdce.edu",  "Prof. Sankalp Sonu",           "CSE-DS", "9811200005"),
    "DS:RKM":   ("rohit.kumar.ds@rrsdce.edu",   "Prof. Rohit Kumar",            "CSE-DS", "9811200006"),
    "DS:MSA":   ("shahid.ahmad@rrsdce.edu",     "Prof. Md. Shahid Ahmad",       "CSE-DS", "9811200007"),

    # ---- CE ----
    "CE:LK":    ("lakshmi.kant@rrsdce.edu",     "Mr. Lakshmi Kant",             "CE",  "9811300001"),
    "CE:NNJ":   ("nityanand.jha@rrsdce.edu",    "Mr. Nityanand Jha",            "CE",  "9811300002"),
    "CE:SK":    ("sanjeet.kumar@rrsdce.edu",    "Mr. Sanjeet Kumar",            "CE",  "9811300003"),
    "CE:AA":    ("asfaque.ansari@rrsdce.edu",   "Dr. Md. Asfaque Ansari",       "CE",  "9811300004"),
    "CE:KK":    ("krishna.keshav@rrsdce.edu",   "Mr. Krishna Keshav",           "CE",  "9811300005"),
    "CE:AS":    ("aparna.srivastava@rrsdce.edu","Ms. Aparna Srivastava",        "CE",  "9811300006"),
    "CE:SKI":   ("suman.kumari@rrsdce.edu",     "Dr. Suman Kumari",             "CE",  "9811300007"),

    # ---- CHE ----
    "CHE:AM":   ("amarnath.mehta@rrsdce.edu",   "Prof. Amarnath Mehta",         "CHE", "9811400001"),
    "CHE:AR":   ("alok.raj@rrsdce.edu",         "Prof. Alok Raj",               "CHE", "9811400002"),
    "CHE:JN":   ("jyotendra.nath@rrsdce.edu",   "Dr. Jyotendra Nath",           "CHE", "9811400003"),
    "CHE:RK":   ("rohit.kumar@rrsdce.edu",      "Prof. Rohit Kumar",            "CHE", "9811400004"),

    # ---- EEE ----
    "EEE:MS":   ("mahesh.singh@rrsdce.edu",     "Dr. Mahesh Singh",             "EEE", "9811500001"),
    "EEE:DS":   ("swati.eee@rrsdce.edu",        "Dr. Swati",                    "EEE", "9811500002"),
    "EEE:GS":   ("gholam.sarwer@rrsdce.edu",    "Mr. Gholam Sarwer",            "EEE", "9811500003"),
    "EEE:PK":   ("pankaj.kumar@rrsdce.edu",     "Mr. Pankaj Kumar",             "EEE", "9811500004"),
    "EEE:TP":   ("tarun.prakash@rrsdce.edu",    "Dr. Tarun Prakash",            "EEE", "9811500005"),
    "EEE:PRK":  ("prity.kumari@rrsdce.edu",     "Mrs. Prity Kumari",            "EEE", "9811500006"),
    "EEE:VK":   ("vikash.kumar@rrsdce.edu",     "Mr. Vikash Kumar",             "EEE", "9811500007"),

    # ---- ME ----
    "ME:AK":    ("abhishek.kumar@rrsdce.edu",   "Prof. Abhishek Kumar",         "ME",  "9811600001"),
    "ME:MPI":   ("perwej.iqbal@rrsdce.edu",     "Dr. Md. Perwej Iqbal",         "ME",  "9811600002"),
    "ME:RK":    ("rahul.kumar.me@rrsdce.edu",   "Prof. Rahul Kumar",            "ME",  "9811600003"),
    "ME:VKC":   ("vijay.chaudhary@rrsdce.edu",  "Prof. Vijay Kumar Chaudhary",  "ME",  "9811600004"),
    "ME:NK":    ("navin.kumar@rrsdce.edu",      "Prof. Navin Kumar",            "ME",  "9811600005"),
    "ME:MR":    ("manjeet.raj@rrsdce.edu",      "Prof. Manjeet Raj",            "ME",  "9811600006"),
}

teacher_objs = {}
for key, (email, name, bcode, phone) in teachers_data.items():
    t = models.Teacher(
        email=email,
        password_hash=auth.hash_password("teacher123"),
        name=name,
        phone=phone,
        branch_id=branches[bcode].id,
        created_by_admin_id=admins[bcode].id,
        is_verified=True,
        password_changed=True,
    )
    db.add(t)
    teacher_objs[key] = t
db.commit()
for t in teacher_objs.values():
    db.refresh(t)
print(f"✓ Created {len(teacher_objs)} teachers across 6 branches")

# =========================
# 6. STUDENTS (all 6 branches)
# =========================

# ------------- CSE (2023-27, Sem 5) -------------
cse_regular = [
    ("23105125001", "Gautam Kumar Singh", date(2005, 3, 22)),
    ("23105125002", "Chandan Kumar", date(2005, 6, 10)),
    ("23105125003", "Kasif Sohail", date(2005, 2, 14)),
    ("23105125004", "Ritam Raj", date(2005, 9, 1)),
    ("23105125005", "Santosh Kumar Sah", date(2005, 11, 25)),
    ("23105125006", "Subham Kumar", date(2005, 4, 8)),
    ("23105125007", "Ram Manjaykumar Ramyatan", date(2005, 1, 17)),
    ("23105125008", "Alok Kumar", date(2005, 5, 30)),
    ("23105125009", "Rohit Kumar", date(2005, 7, 21)),
    ("23105125010", "Divyanshu Raj", date(2005, 8, 4)),
    ("23105125011", "Kunal Kumar", date(2005, 12, 11)),
    ("23105125012", "Aayush Kumar", date(2005, 10, 3)),
    ("23105125013", "Ayush Kumar", date(2005, 2, 28)),
    ("23105125014", "Raushan Kumar", date(2005, 6, 19)),
    ("23105125016", "Rishikesh Kumar", date(2005, 3, 7)),
    ("23105125017", "Saroj Kumar", date(2005, 11, 16)),
    ("23105125018", "Pragati", date(2005, 5, 24)),
    ("23105125019", "Saqlain Ahmad", date(2005, 9, 12)),
    ("23105125020", "Harshit Kashyap", date(2005, 1, 2)),
    ("23105125021", "Abhishek Kumar", date(2005, 7, 27)),
    ("23105125022", "Rashmi Sinha", date(2005, 4, 16)),
    ("23105125023", "Vishal Kumar", date(2005, 8, 15)),
    ("23105125024", "Anish Kumar", date(2005, 6, 5)),
    ("23105125025", "Anand Kumar", date(2005, 10, 22)),
    ("23105125026", "Ayushi", date(2005, 12, 8)),
    ("23105125027", "Ranjan Kumar", date(2005, 3, 14)),
    ("23105125028", "Ravish Raj", date(2005, 2, 9)),
    ("23105125029", "Abhishek Kumar", date(2005, 5, 18)),
    ("23105125030", "Akriti Kumari", date(2005, 9, 25)),
    ("23105125031", "Pallavi Bharti", date(2005, 7, 8)),
    ("23105125032", "Khushi Kumari", date(2005, 11, 4)),
    ("23105125033", "Anshu Kumari", date(2005, 4, 21)),
    ("23105125034", "Radha Kumari", date(2005, 1, 29)),
    ("23105125035", "Sonu Kumar", date(2005, 8, 12)),
    ("23105125036", "Sonal Kumari", date(2005, 6, 26)),
    ("23105125037", "Ashmita Kumari", date(2005, 3, 3)),
    ("23105125038", "Shiksha Kumari", date(2005, 10, 17)),
    ("23105125039", "Ayushi Prasad", date(2005, 5, 9)),
    ("23105125040", "Smriti Kumari", date(2005, 12, 14)),
    ("23105125041", "Rupam Kumari", date(2005, 7, 1)),
    ("23105125042", "Chandani Kumari", date(2005, 2, 24)),
    ("23105125043", "Gautam Kumar", date(2005, 9, 6)),
    ("23105125044", "Deepak Kumar Thakur", date(2005, 4, 11)),
    ("23105125045", "Riya Rati", date(2005, 11, 18)),
    ("23105125046", "Sneha Kumari Pal", date(2005, 6, 15)),
    ("23105125047", "Princy Patel", date(2005, 8, 28)),
    ("23105125048", "Ritik Kumar", date(2005, 1, 23)),
    ("23105125049", "Atul Nayan", date(2005, 3, 31)),
    ("23105125050", "Bishal Kumar", date(2005, 10, 7)),
    ("23105125051", "Yash Bhartiya", date(2005, 5, 13)),
    ("23105125052", "Sonu Kumar Mishra", date(2005, 12, 2)),
    ("23105125054", "Sonali Raj", date(2005, 9, 19)),
]
cse_le = [
    ("24105125901", "Manisha Kumari", date(2005, 5, 19)),
    ("24105125902", "Muskan Roy", date(2005, 3, 14)),
    ("24105125905", "Neha Kumari", date(2005, 8, 2)),
    ("24105125906", "Priti Kumari", date(2005, 4, 11)),
    ("24105125907", "Harsh Raj", date(2005, 9, 28)),
    ("24105125908", "Raj Kumar", date(2005, 6, 7)),
    ("24105125909", "Shritesh Kumar Jayant", date(2005, 12, 20)),
    ("24105125910", "Surjit Saurav", date(2005, 2, 5)),
    ("24105125911", "Aman Kumar", date(2005, 7, 13)),
    ("24105125912", "Lakshmi Kumari", date(2005, 10, 18)),
]
cse_back = [
    ("21105125044", "Shubham Kumar",      date(2003, 6, 15)),
    ("22105125003", "Bikas Kumar",        date(2004, 7, 22)),
    ("22105125048", "Antu Kumar Paswan",  date(2004, 11, 3)),
]

# ------------- CSE-DS (2023-27, Sem 5) - from DS_Records_23.pdf -------------
csds_regular = [
    ("23153125001", "Naveen Kumar",           date(2005, 1, 15)),
    ("23153125002", "Aman Kumar",             date(2005, 2, 8)),
    ("23153125003", "Sarthak Kumar",          date(2005, 3, 12)),
    ("23153125004", "Abhiranjan Kumar",       date(2005, 4, 20)),
    ("23153125005", "Raj Wardhan Kumar",      date(2005, 5, 6)),
    ("23153125006", "Ankit Kumar",            date(2005, 6, 18)),
    ("23153125007", "Reshmi Kumari",          date(2005, 7, 25)),
    ("23153125008", "Pushkar Kumar",          date(2005, 8, 11)),
    ("23153125009", "Anchal Kumari",          date(2005, 9, 3)),
    ("23153125010", "Kunal Anand",            date(2005, 10, 17)),
    ("23153125013", "Ishika Sinha",           date(2005, 11, 22)),
    ("23153125016", "Abhishek Kumar",         date(2005, 12, 9)),
    ("23153125018", "Rishu Raj",              date(2005, 1, 28)),
    ("23153125020", "Sadaf Ijaz",             date(2005, 2, 14)),
    ("23153125021", "Rupam Kumari",           date(2005, 3, 30)),
    ("23153125022", "Sachin Singh",           date(2005, 4, 7)),
    ("23153125023", "Bindiya Kumari",         date(2005, 5, 19)),
    ("23153125024", "Sonu Prakash Mahaseth",  date(2005, 6, 26)),
    ("23153125025", "Md Ujer Alam",           date(2005, 7, 4)),
    ("23153125026", "Khushi Kumari",          date(2005, 8, 16)),
    ("23153125027", "Kumar Soumya Deep",      date(2005, 9, 23)),
    ("23153125028", "Ankita Kumari",          date(2005, 10, 1)),
    ("23153125030", "Arun Kumar Singh",       date(2005, 11, 13)),
    ("23153125031", "Prakriti Bharti",        date(2005, 12, 27)),
    ("23153125032", "Md Bittu Hussain",       date(2005, 1, 5)),
    ("23153125034", "Aarohi Prakash",         date(2005, 2, 18)),
    ("23153125035", "Suruti Kumari",          date(2005, 3, 24)),
    ("23153125036", "Manisha Kumari",         date(2005, 4, 2)),
    ("23153125041", "Sanjeet Kumar",          date(2005, 5, 15)),
    ("23153125042", "Richa Singh",            date(2005, 6, 28)),
    ("23153125044", "Pratyush Kumar",         date(2005, 7, 11)),
    ("23153125047", "Satyam Raj",             date(2005, 8, 24)),
    ("23153125048", "Janvi Singh",            date(2005, 9, 7)),
    ("23153125050", "Ananya",                 date(2005, 10, 20)),
    ("23153125051", "Supriya Kumari",         date(2005, 11, 2)),
    ("23153125052", "Kalyani Kumari",         date(2005, 12, 14)),
    ("23153125055", "Sumit Sagar",            date(2005, 1, 21)),
    ("23153125056", "Piyush Kumar",           date(2005, 2, 4)),
    ("23153125057", "Aditya Raj",             date(2005, 3, 17)),
    ("23153125058", "Badal Jha",              date(2005, 4, 29)),
    ("23153125059", "Amit Kumar",             date(2005, 5, 12)),
    ("23153125060", "Shivam Kumar",           date(2005, 6, 25)),
]
csds_le = [
    ("24153125901", "Niraj Kumar",    date(2005, 7, 8)),
    ("24153125902", "Ritu Raj",       date(2005, 8, 21)),
    ("24153125903", "Jayvir Kumar",   date(2005, 9, 4)),
    ("24153125904", "Ritesh Kumar",   date(2005, 10, 16)),
    ("24153125905", "Rakhi Kumari",   date(2005, 11, 28)),
]

# ------------- CE (2023-27, Sem 5) - from uploaded images -------------
ce_back = [
    ("22101125054", "Anshu Sherstha",       date(2004, 2, 15)),
    ("22101125057", "Kumari Jyoti",         date(2004, 6, 10)),
]
ce_regular = [
    ("23101125002", "Arvind Kumar",             date(2005, 1, 12)),
    ("23101125003", "Sameer Raj",               date(2005, 2, 18)),
    ("23101125004", "Ayush Kumar",              date(2005, 3, 22)),
    ("23101125005", "Suraj Kumar",              date(2005, 4, 8)),
    ("23101125007", "Rahul Kumar",              date(2005, 5, 14)),
    ("23101125008", "Sameer Siddhartha",        date(2005, 6, 25)),
    ("23101125009", "Prince Kumar",             date(2005, 7, 7)),
    ("23101125010", "Ravi Ranjan Kumar",        date(2005, 8, 19)),
    ("23101125011", "Priyanshu Kumar",          date(2005, 9, 3)),
    ("23101125012", "Rohit Raj",                date(2005, 10, 11)),
    ("23101125013", "Aakash Kumar",             date(2005, 11, 23)),
    ("23101125015", "Ankit Kumar",              date(2005, 12, 5)),
    ("23101125016", "Priyanshu Kumar Gautam",   date(2005, 1, 17)),
    ("23101125017", "Satwik Singh",             date(2005, 2, 28)),
    ("23101125018", "Rohan Kumar",              date(2005, 3, 9)),
    ("23101125019", "Akanksha Sharma",          date(2005, 4, 21)),
    ("23101125021", "Ritu Raj",                 date(2005, 5, 4)),
    ("23101125023", "Jyoti Rani",               date(2005, 6, 16)),
    ("23101125024", "Hemant Kumar Choudhary",   date(2005, 7, 30)),
    ("23101125025", "Swati Verma",              date(2005, 8, 8)),
    ("23101125026", "Prashant Kumar",           date(2005, 9, 20)),
    ("23101125027", "Md Altamash Alam",         date(2005, 10, 2)),
    ("23101125031", "Dilip Kumar",              date(2005, 11, 15)),
    ("23101125032", "Sohani Bharti",            date(2005, 12, 27)),
    ("23101125033", "Rashmi Kumari",            date(2005, 1, 6)),
    ("23101125034", "Vishakha Kumari",          date(2005, 2, 19)),
    ("23101125036", "Gulshan Kumar",            date(2005, 3, 11)),
    ("23101125038", "Shiksha Suman",            date(2005, 4, 23)),
    ("23101125039", "Sourav Kumar",             date(2005, 5, 5)),
    ("23101125041", "Vivek Kumar",              date(2005, 6, 17)),
    ("23101125043", "Vivek Kumar",              date(2005, 7, 29)),
    ("23101125044", "Nitish Kumar",             date(2005, 8, 13)),
    ("23101125045", "Azad Kumar",               date(2005, 9, 24)),
    ("23101125047", "Preetam Kumari",           date(2005, 10, 6)),
    ("23101125048", "Sujeet Kumar",             date(2005, 11, 18)),
    ("23101125049", "Amit Kumar Sah",           date(2005, 12, 31)),
    ("23101125052", "Puja Kumari",              date(2005, 1, 14)),
]
ce_le = [
    ("24101125901", "Richa Bharti",             date(2005, 2, 25)),
    ("24101125902", "Rahul Kumar",              date(2005, 3, 7)),
    ("24101125903", "Sujal Kumar",              date(2005, 4, 19)),
    ("24101125904", "Vikash Kumar",             date(2005, 5, 1)),
    ("24101125905", "Amarjit Kumar",            date(2005, 6, 12)),
    ("24101125906", "Kumar Abhishek Mehta",     date(2005, 7, 24)),
    ("24101125907", "Prince Raj",               date(2005, 8, 5)),
    ("24101125908", "Pooja Kumari",             date(2005, 9, 17)),
    ("24101125909", "Swarnjit Singh",           date(2005, 10, 29)),
    ("24101125910", "Sonu Kumar",               date(2005, 11, 10)),
    ("24101125911", "Arju Aisha",               date(2005, 12, 22)),
]

# ------------- CHE (2023-27, Sem 5) - from Ch_Records_23.pdf -------------
che_back = [
    ("22114125034", "Raushan Kumar",        date(2004, 3, 12)),
    ("22114125036", "Nishant Kumar",        date(2004, 6, 5)),
]
che_regular = [
    ("23114125002", "Neeraj Kumar",         date(2005, 1, 10)),
    ("23114125004", "Navneet Kumar",        date(2005, 2, 22)),
    ("23114125007", "Nitish Kumar",         date(2005, 3, 14)),
    ("23114125008", "Raju Kumar",           date(2005, 4, 26)),
    ("23114125009", "Anshu Kumari",         date(2005, 5, 8)),
    ("23114125011", "Roma Kumari",          date(2005, 6, 19)),
    ("23114125012", "Harsh Raj",            date(2005, 7, 2)),
    ("23114125013", "Ashmita Kumari",       date(2005, 8, 14)),
    ("23114125014", "Anjali Kumari",        date(2005, 9, 27)),
    ("23114125015", "Navneet Kumar",        date(2005, 10, 9)),
    ("23114125016", "Sonu Kumar",           date(2005, 11, 21)),
    ("23114125018", "Prince Kumar",         date(2005, 12, 3)),
    ("23114125019", "Simaran Kumari",       date(2005, 1, 16)),
    ("23114125021", "Gaurav Kumar",         date(2005, 2, 28)),
    ("23114125022", "Md. Maroof",           date(2005, 3, 11)),
    ("23114125024", "Harsh Kumar",          date(2005, 4, 23)),
    ("23114125025", "Nitish Kumar Yadav",   date(2005, 5, 5)),
    ("23114125026", "Utpal Kumar",          date(2005, 6, 17)),
    ("23114125027", "Ravi Sharan",          date(2005, 7, 29)),
    ("23114125028", "Anshu Kumari",         date(2005, 8, 12)),
    ("23114125029", "Sanu Kumari",          date(2005, 9, 24)),
    ("23114125034", "Sumit Kumar",          date(2005, 10, 6)),
    ("23114125035", "Divesh Kumar",         date(2005, 11, 18)),
    ("23114125036", "Abhishek Kumar",       date(2005, 12, 30)),
    ("23114125038", "Sunil Kumar",          date(2005, 1, 13)),
    ("23114125039", "Anjali Kumari",        date(2005, 2, 25)),
]
che_le = [
    ("23114125916", "Anuj Kumar",      date(2005, 3, 7)),
    ("23114125917", "Gulshan Kumar",   date(2005, 4, 19)),
    ("24114125901", "Ravi Raj",        date(2005, 5, 1)),
    ("24114125902", "Sandhya Kumari",  date(2005, 6, 13)),
    ("24114125903", "Nitish Kumar",    date(2005, 7, 25)),
]

# ------------- EEE (2023-27, Sem 5) - from EEE_Records_23.pdf -------------
eee_back = [
    ("22110125028", "Abhay Raj",            date(2004, 5, 10)),
]
eee_regular = [
    ("23110125001", "Mudassir Hussain",      date(2005, 1, 8)),
    ("23110125003", "Mrityunjay Pathak",     date(2005, 2, 19)),
    ("23110125005", "Yashu Vijay",           date(2005, 3, 2)),
    ("23110125006", "Nisha Kumari",          date(2005, 4, 14)),
    ("23110125007", "Ravi Kumar",            date(2005, 5, 26)),
    ("23110125008", "Amrit Kumar",           date(2005, 6, 7)),
    ("23110125009", "Sanjana Kumari",        date(2005, 7, 20)),
    ("23110125010", "Pallavi",               date(2005, 8, 1)),
    ("23110125012", "Divya Prakash",         date(2005, 9, 13)),
    ("23110125013", "Ayush Kumar",           date(2005, 10, 25)),
    ("23110125014", "Rajnish Kumar",         date(2005, 11, 6)),
    ("23110125015", "Premranjan Prabhat",    date(2005, 12, 18)),
    ("23110125016", "Arsh Kumar",            date(2005, 1, 30)),
    ("23110125017", "Mahadev Kumar",         date(2005, 2, 11)),
    ("23110125018", "Narayan Trivedi",       date(2005, 3, 24)),
    ("23110125020", "Ankisha Kumari",        date(2005, 4, 5)),
    ("23110125021", "Naincey Kumari",        date(2005, 5, 17)),
    ("23110125022", "Priya Kumari",          date(2005, 6, 29)),
    ("23110125023", "Simran Rani",           date(2005, 7, 11)),
    ("23110125024", "Sweety Kumari",         date(2005, 8, 23)),
    ("23110125025", "Simple Kumari",         date(2005, 9, 4)),
    ("23110125026", "Subhash Kumar",         date(2005, 10, 16)),
    ("23110125027", "Neha Kumari",           date(2005, 11, 28)),
    ("23110125028", "Sanjeev Kumar",         date(2005, 12, 10)),
    ("23110125029", "Sunny Kumar",           date(2005, 1, 22)),
    ("23110125030", "Abhay Kumar Singh",     date(2005, 2, 3)),
    ("23110125031", "Srishti Kumari",        date(2005, 3, 15)),
    ("23110125033", "Mausam Kumari",         date(2005, 4, 27)),
    ("23110125034", "Deepak Kumar Mishra",   date(2005, 5, 9)),
    ("23110125039", "Sawan Kumar",           date(2005, 6, 21)),
    ("23110125044", "Rahul Kumar",           date(2005, 7, 3)),
    ("23110125045", "Mohan Kumar Tiwari",    date(2005, 8, 15)),
]
eee_le = [
    ("24110125901", "Ankush Kumar",          date(2005, 9, 27)),
    ("24110125902", "Prem Prakash",          date(2005, 10, 9)),
    ("24110125903", "Anurag Kumar",          date(2005, 11, 21)),
    ("24110125904", "Ankit Kumar",           date(2005, 12, 2)),
    ("24110125905", "Shivam Kumar",          date(2005, 1, 14)),
    ("24110125906", "Shantanoo Kumar",       date(2005, 2, 26)),
    ("24110125907", "Kishundev Kumar",       date(2005, 3, 8)),
    ("24110125908", "Sudhanshu Kumar",       date(2005, 4, 20)),
    ("24110125909", "Nalin Gupta",           date(2005, 5, 2)),
    ("24110125910", "Aman Prakash",          date(2005, 6, 14)),
    ("24110125911", "Prashant Kumar Golu",   date(2005, 7, 26)),
    ("24110125912", "Golu Kumar",            date(2005, 8, 7)),
    ("24110125913", "Rupam Kumari",          date(2005, 9, 19)),
]

# ------------- ME (2023-27, Sem 5) - from ME_Records_23.pdf -------------
me_back = [
    ("21102125025", "Roushni Patel",       date(2003, 5, 18)),
    ("21102125043", "Jyoti Kumari",        date(2003, 9, 11)),
    ("22102125009", "Babul Kumar",         date(2004, 3, 22)),
    ("22102125029", "Babul Kumar",         date(2004, 11, 4)),
]
me_regular = [
    ("23102125002", "Purushottam Kumar",   date(2005, 1, 15)),
    ("23102125003", "Mandip Kumar",        date(2005, 2, 28)),
    ("23102125004", "Nigam Kumar",         date(2005, 3, 12)),
    ("23102125006", "Ashish Ranjan",       date(2005, 4, 24)),
    ("23102125007", "Krishna Raj",         date(2005, 5, 6)),
    ("23102125009", "Amarnath Kumar",      date(2005, 6, 18)),
    ("23102125012", "Kaushal Kumar",       date(2005, 7, 30)),
    ("23102125013", "Vikash Kumar",        date(2005, 8, 11)),
    ("23102125014", "Md Abutalib",         date(2005, 9, 23)),
    ("23102125015", "Gautam Kumar",        date(2005, 10, 5)),
    ("23102125017", "Abhijeet Kumar",      date(2005, 11, 17)),
    ("23102125019", "Sujeet Kumar Sahu",   date(2005, 12, 29)),
    ("23102125020", "Manglesh Kumar",      date(2005, 1, 13)),
    ("23102125022", "Bipul Kumar",         date(2005, 2, 25)),
    ("23102125024", "Sunny Kumar",         date(2005, 3, 7)),
    ("23102125025", "Deepak Kumar",        date(2005, 4, 19)),
    ("23102125026", "Sanskar Kumar",       date(2005, 5, 1)),
]
me_le = [
    ("24102125902", "Shivam Kumar",        date(2005, 6, 13)),
    ("24102125903", "Nishant Kumar",       date(2005, 7, 25)),
    ("24102125904", "Rajesh Kumar",        date(2005, 8, 6)),
    ("24102125905", "Karan Aryan",         date(2005, 9, 18)),
    ("24102125907", "Saurav Kumar",        date(2005, 10, 30)),
    ("24102125908", "Sonu Kumar",          date(2005, 11, 11)),
    ("24102125909", "Kanhaiya Kumar",      date(2005, 12, 23)),
]

# Aggregate branch-wise and add to DB
branch_rosters = {
    "CSE":    (cse_regular, cse_le, cse_back),
    "CSE-DS": (csds_regular, csds_le, []),
    "CE":     (ce_regular, ce_le, ce_back),
    "CHE":    (che_regular, che_le, che_back),
    "EEE":    (eee_regular, eee_le, eee_back),
    "ME":     (me_regular, me_le, me_back),
}

all_students_by_branch = {}
total_students = 0
for bcode, (reg_list, le_list, back_list) in branch_rosters.items():
    students = []
    for reg, name, dob in reg_list:
        s = models.Student(
            reg_no=reg, name=name, date_of_birth=dob,
            branch_id=branches[bcode].id,
            batch_id=batches["2023-27"].id,
            current_semester=5, student_type="regular",
            is_verified=True,
        )
        db.add(s)
        students.append(s)
    for reg, name, dob in le_list:
        s = models.Student(
            reg_no=reg, name=name, date_of_birth=dob,
            branch_id=branches[bcode].id,
            batch_id=batches["2023-27"].id,
            current_semester=5, student_type="lateral_entry",
            is_verified=True,
        )
        db.add(s)
        students.append(s)
    for reg, name, dob in back_list:
        batch_year = int("20" + reg[:2])
        batch_name = f"{batch_year}-{str(batch_year + 4)[-2:]}"
        target_batch = batches.get(batch_name, batches["2023-27"])
        s = models.Student(
            reg_no=reg, name=name, date_of_birth=dob,
            branch_id=branches[bcode].id,
            batch_id=target_batch.id,
            current_semester=5, student_type="back_year",
            is_verified=True,
        )
        db.add(s)
        students.append(s)
    all_students_by_branch[bcode] = students
    total_students += len(students)
db.commit()
for students in all_students_by_branch.values():
    for s in students:
        db.refresh(s)
print(f"✓ Created {total_students} students across 6 branches")

# =========================
# 7. 5TH SEM SUBJECTS (all 6 branches, from time-tables)
# =========================

subjects_by_branch = {
    # ---- CSE 5th Sem ----
    "CSE": [
        ("105501", "Artificial Intelligence",           "CSE:RKR"),
        ("105502", "Database Management System",       "CSE:AS"),
        ("105503", "Formal Language & Automata Theory","CSE:SS"),
        ("105504", "Software Engineering",             "CSE:RR"),
        ("105505", "Seminar",                          "CSE:MAA"),
        ("100508", "Professional Skill Development",   "CSE:AKJ"),
        ("105502P","Database Management System Lab",   "CSE:AS"),
    ],
    # ---- CSE-DS 5th Sem ----
    "CSE-DS": [
        ("153501", "Machine Learning",                        "DS:MDA"),
        ("153502", "Database Management System (DBMS)",       "DS:RKR"),
        ("153503", "Computer Networks",                       "DS:AK"),
        ("153504", "Python Programming",                      "DS:SNS"),
        ("153505", "Seminar",                                 "DS:SS"),
        ("153511P","Summer Entrepreneurship-II",              "DS:RKM"),
        ("153502P","DBMS Lab",                                "DS:AK"),
        ("153503P","Computer Networks Lab",                   "DS:AK"),
        ("153508", "Professional Practice, Law & Ethics",     "DS:MSA"),
    ],
    # ---- CE 5th Sem ----
    "CE": [
        ("MOM",    "Mechanics of Materials",                 "CE:LK"),
        ("HE",     "Hydraulic Engineering",                  "CE:NNJ"),
        ("ADCS",   "Analysis and Design of Concrete Structures", "CE:SK"),
        ("GE1",    "Geotechnical Engineering I",             "CE:AA"),
        ("HWRE",   "Hydrology & Water Resource Engineering", "CE:KK"),
        ("EE1",    "Environmental Engineering I",            "CE:AS"),
        ("TE",     "Transportation Engineering",             "CE:SKI"),
        ("ES",     "Environmental Science",                  "CE:AS"),
        ("SE",     "Summer Entrepreneurship",                "CE:SKI"),
    ],
    # ---- CHE 5th Sem ----
    "CHE": [
        ("114501", "Hazard & Risk Analysis",                 "CHE:AM"),
        ("114502", "Industrial Pollution & Control",         "CHE:AR"),
        ("114503", "Introduction to Analytical Instrument",  "CHE:JN"),
        ("114504", "Summer Internship – I",                  "CHE:AR"),
        ("114505", "Entrepreneurship Development & Startups","CHE:AR"),
        ("114506", "Sports, Yoga and Meditation",            "CHE:RK"),
        ("100518", "Renewable Energy Sources (Open Elective)","CHE:AM"),
    ],
    # ---- EEE 5th Sem ----
    "EEE": [
        ("110501", "Analog & Digital Communication System",   "EEE:MS"),
        ("100502", "Control System",                          "EEE:DS"),
        ("100506", "Power Electronics",                       "EEE:GS"),
        ("100507", "Power System-I (Apparatus & Modelling)",  "EEE:PK"),
        ("IKT",    "Essence of Indian Knowledge Traditional", "EEE:TP"),
        ("MOOCS",  "MOOCS / NEPTEL Course",                   "EEE:PRK"),
        ("CDP",    "Capston Design Project",                  "EEE:DS"),
        ("SIP2",   "Summer Internship II",                    "EEE:VK"),
        ("PEL1",   "Professional Elective Laboratory-I",      "EEE:VK"),
    ],
    # ---- ME 5th Sem ----
    "ME": [
        ("102501", "Fluid Mechinery",                         "ME:AK"),
        ("102502", "Manufacturing Process",                   "ME:MPI"),
        ("102503", "Kinematics of Machine",                   "ME:RK"),
        ("102504", "Heat Transfer",                           "ME:VKC"),
        ("100510P","Summer Entrepreneurship II",              "ME:RK"),
        ("100511P","Open Elective-1 (NPTEL Courses-2)",       "ME:NK"),
        ("GATE",   "GATE/ESE Preparation",                    "ME:MR"),
        ("IAS",    "Introduction to Ansys Software",          "ME:MPI"),
        ("ITS",    "Introduction to Solid Works",             "ME:RK"),
    ],
}

all_subjects_by_branch = {}
total_subjects = 0
for bcode, subj_list in subjects_by_branch.items():
    subj_objs = []
    for code, name, teacher_key in subj_list:
        # L-T-P based credit: default 3. Labs (code has 'P' or 'Lab') = 2. Projects/Seminar = 1
        credits = 3
        if 'P' in code and code.endswith('P'):
            credits = 2
        elif 'Lab' in name or 'lab' in name:
            credits = 2
        elif any(kw in name for kw in ['Seminar', 'Internship', 'Entrepreneurship', 'GATE', 'NPTEL', 'Sports', 'Meditation', 'Yoga']):
            credits = 1
        subj = models.Subject(
            code=code, name=name,
            branch_id=branches[bcode].id,
            batch_id=batches["2023-27"].id,
            semester=5,
            teacher_id=teacher_objs[teacher_key].id,
            credits=credits,
            session="2025-26",
        )
        db.add(subj)
        subj_objs.append(subj)
    all_subjects_by_branch[bcode] = subj_objs
    total_subjects += len(subj_objs)
db.commit()
for subj_objs in all_subjects_by_branch.values():
    for s in subj_objs:
        db.refresh(s)
print(f"✓ Created {total_subjects} 5th-sem subjects across 6 branches")

# =========================
# 8. ENROLLMENTS
# =========================
enroll_count = 0
for bcode, students in all_students_by_branch.items():
    subj_objs = all_subjects_by_branch[bcode]
    for s in students:
        if s.current_semester == 5:
            for subj in subj_objs:
                db.add(models.Enrollment(student_id=s.id, subject_id=subj.id))
                enroll_count += 1
db.commit()
print(f"✓ {enroll_count} enrollments created")

# =========================
# SUMMARY
# =========================
print("\n" + "=" * 60)
print("  SEED COMPLETE - CLASS ATTENDANCE v1.1")
print("=" * 60)
print("\n🔐 LOGIN CREDENTIALS\n")
print("SUPER ADMIN:")
print("  vishal@rrsdce.edu / vishal123")
print("\nBRANCH HODs (all use password: admin123)")
for code, email, name, _ in admin_info:
    print(f"  [{code:7}] {email}")
print("\nTEACHERS (all use password: teacher123) — sample:")
print(f"  [CSE]    rajiv.ranjan@rrsdce.edu  (Prof. Rajiv Kumar Ranjan)")
print(f"  [CSE-DS] md.arshad.ali.ds@rrsdce.edu (Prof. Md Arshad Ali)")
print(f"  [CE]     lakshmi.kant@rrsdce.edu  (Mr. Lakshmi Kant)")
print(f"  [CHE]    amarnath.mehta@rrsdce.edu (Prof. Amarnath Mehta)")
print(f"  [EEE]    mahesh.singh@rrsdce.edu  (Dr. Mahesh Singh)")
print(f"  [ME]     abhishek.kumar@rrsdce.edu (Prof. Abhishek Kumar)")
print(f"  ... {len(teacher_objs)} teachers total")
print("\nSTUDENT (Reg + DOB):")
print("  CSE    : 23105125023 / 2005-08-15 (Vishal Kumar)")
print("  CSE-DS : 23153125001 / 2005-01-15 (Naveen Kumar)")
print("  CE     : 23101125004 / 2005-03-22 (Ayush Kumar)")
print("  CHE    : 23114125004 / 2005-02-22 (Navneet Kumar)")
print("  EEE    : 23110125003 / 2005-02-19 (Mrityunjay Pathak)")
print("  ME     : 23102125012 / 2005-07-30 (Kaushal Kumar)")
print("=" * 60)
print(f"\n🏫 Branches  : 6   ({', '.join(branches.keys())})")
print(f"📚 Batches   : 4   (2022-26 Sem8, 2023-27 Sem5, 2024-28 Sem3, 2025-29 Sem1)")
print(f"👥 Students  : {total_students}")
print(f"👨‍🏫 Teachers  : {len(teacher_objs)}")
print(f"📘 Subjects  : {total_subjects}  (Sem 5, batch 2023-27)")
print(f"📝 Enrolls   : {enroll_count}")
print("=" * 60)

db.close()
