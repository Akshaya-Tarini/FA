const { getToken, fetchDataset } = require('../services/apiService');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const User = require('../models/User');

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const getRecords = (rawData, key, type) => {
  if (Array.isArray(rawData?.[key])) return rawData[key];
  if (Array.isArray(rawData?.data?.[key])) return rawData.data[key];
  if (Array.isArray(rawData)) return rawData.filter((record) => record.type === type);
  return [];
};

const getReferenceValue = (record, objectKey, idKey, nameKey) => {
  const reference = record[objectKey];
  if (reference && typeof reference === 'object') {
    return reference[idKey] || reference[nameKey] || reference._id;
  }
  return record[idKey] || record[nameKey] || reference;
};

const rejectDuplicate = (seen, value) => {
  if (!value) return true;
  if (seen.has(value)) return true;
  seen.add(value);
  return false;
};

const ensureStudentUser = async (student) => {
  const password = String(student.studentId).toLowerCase();
  const existing = await User.findOne({ email: student.email });

  if (existing) {
    if (existing.role !== 'student') return;
    existing.studentId = student.studentId;
    existing.password = password;
    await existing.save();
    return;
  }

  await User.create({
    email: student.email,
    password,
    role: 'student',
    studentId: student.studentId,
  });
};

exports.syncData = async (req, res, next) => {
  try {
    // 1. Authenticate with external API
    const token = await getToken(process.env.STUDENT_ID, process.env.STUDENT_PASSWORD);
    
    // 2. Fetch dataset
    const rawData = await fetchDataset(token);
    // Assuming the dataset could be an array of mixed entities or an object containing students, companies
    // For this simulation, we'll assume it returns an object with arrays of students and companies
    // Adjust according to the actual shape of the response
    const studentsToSync = getRecords(rawData, 'students', 'student');
    const companiesToSync = getRecords(rawData, 'companies', 'company');
    const drivesToSync = getRecords(rawData, 'drives', 'drive');
    const applicationsToSync = getRecords(rawData, 'applications', 'application');
    
    const stats = {
      studentsProcessed: 0,
      studentsRejected: 0,
      companiesProcessed: 0,
      companiesRejected: 0,
      drivesProcessed: 0,
      drivesRejected: 0,
      applicationsProcessed: 0,
      applicationsRejected: 0,
      duplicateStudentIds: 0,
      duplicateApplicationIds: 0,
      invalidCompanyReferences: 0,
    };

    const seenStudentIds = new Set();
    const seenApplicationIds = new Set();

    // 3. Validate and sync students
    for (const st of studentsToSync) {
      if (rejectDuplicate(seenStudentIds, st.studentId)) {
        stats.studentsRejected++;
        stats.duplicateStudentIds++;
        continue;
      }
      if (!st.cgpa || isNaN(st.cgpa) || st.cgpa < 0 || st.cgpa > 10) {
        stats.studentsRejected++;
        continue;
      }
      if (!validateEmail(st.email)) {
        stats.studentsRejected++;
        continue;
      }
      
      try {
        const studentPayload = {
          ...st,
          email: String(st.email).toLowerCase(),
        };
        delete studentPayload.type;

        await Student.updateOne(
          { studentId: st.studentId },
          { $set: studentPayload },
          { upsert: true, runValidators: true }
        );
        await ensureStudentUser(studentPayload);
        stats.studentsProcessed++;
      } catch (err) {
        // e.g. duplicate key for email
        stats.studentsRejected++;
      }
    }

    // 4. Validate and sync companies
    for (const co of companiesToSync) {
      if (!co.companyId || !co.name) {
        stats.companiesRejected++;
        continue;
      }

      const companyPayload = {
        ...co,
        minCGPA: co.minCGPA ?? co.minimumCgpa ?? co.minimumCGPA,
      };
      delete companyPayload.minimumCgpa;
      delete companyPayload.minimumCGPA;
      delete companyPayload.type;

      try {
        await Company.updateOne(
          { companyId: co.companyId },
          { $set: companyPayload },
          { upsert: true, runValidators: true }
        );
        stats.companiesProcessed++;
      } catch (err) {
        stats.companiesRejected++;
      }
    }

    // 5. Validate and sync drives with company references
    for (const driveRecord of drivesToSync) {
      const companyReference = getReferenceValue(driveRecord, 'company', 'companyId', 'companyName');
      const company = await Company.findOne({
        $or: [{ companyId: companyReference }, { name: companyReference }],
      });

      if (!driveRecord.driveId || !company) {
        stats.drivesRejected++;
        if (!company) stats.invalidCompanyReferences++;
        continue;
      }

      const drivePayload = {
        ...driveRecord,
        company: company._id,
      };
      delete drivePayload.companyId;
      delete drivePayload.companyName;
      delete drivePayload.type;

      try {
        await Drive.updateOne(
          { driveId: driveRecord.driveId },
          { $set: drivePayload },
          { upsert: true, runValidators: true }
        );
        stats.drivesProcessed++;
      } catch (err) {
        stats.drivesRejected++;
      }
    }

    // 6. Validate and sync applications with student/drive references
    for (const applicationRecord of applicationsToSync) {
      if (rejectDuplicate(seenApplicationIds, applicationRecord.applicationId)) {
        stats.applicationsRejected++;
        stats.duplicateApplicationIds++;
        continue;
      }

      const studentReference = getReferenceValue(applicationRecord, 'student', 'studentId', 'studentName');
      const driveReference = getReferenceValue(applicationRecord, 'drive', 'driveId', 'driveTitle');
      const [student, drive] = await Promise.all([
        Student.findOne({ studentId: studentReference }),
        Drive.findOne({ driveId: driveReference }),
      ]);

      if (!student || !drive) {
        stats.applicationsRejected++;
        continue;
      }

      const applicationPayload = {
        ...applicationRecord,
        student: student._id,
        drive: drive._id,
      };
      delete applicationPayload.studentId;
      delete applicationPayload.studentName;
      delete applicationPayload.driveId;
      delete applicationPayload.driveTitle;
      delete applicationPayload.type;

      try {
        await Application.updateOne(
          { applicationId: applicationRecord.applicationId },
          { $set: applicationPayload },
          { upsert: true, runValidators: true }
        );
        stats.applicationsProcessed++;
      } catch (err) {
        stats.applicationsRejected++;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Database synced successfully',
      data: {
        students: stats.studentsProcessed,
        companies: stats.companiesProcessed,
        drives: stats.drivesProcessed,
        applications: stats.applicationsProcessed,
        rejected: {
          students: stats.studentsRejected,
          companies: stats.companiesRejected,
          drives: stats.drivesRejected,
          applications: stats.applicationsRejected,
        },
        duplicates: {
          studentIds: stats.duplicateStudentIds,
          applicationIds: stats.duplicateApplicationIds,
        },
        invalidCompanyReferences: stats.invalidCompanyReferences,
      },
      stats,
    });
  } catch (err) {
    next(err);
  }
};
