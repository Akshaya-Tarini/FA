require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');

async function upsertUser({ email, password, role, studentId }) {
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({ email, password, role, studentId });
  } else {
    user.password = password;
    user.role = role;
    user.studentId = studentId;
  }

  await user.save();
  console.log(`Ready ${role}: ${email}`);
}

async function seedStudentUser(email, studentId) {
  const student = await Student.findOne({ email, studentId, status: 'active' });
  if (!student) {
    console.log(`Skipped student login ${email}: active synced student not found`);
    return;
  }

  await upsertUser({
    email,
    password: studentId.toLowerCase(),
    role: 'student',
    studentId,
  });
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await upsertUser({
      email: 'admin@test.com',
      password: 'AdminPass123!',
      role: 'admin',
    });

    await upsertUser({
      email: 'placement@test.com',
      password: 'OfficerPass123!',
      role: 'placement_officer',
    });

    await seedStudentUser('student1@gmail.com', 'STU1001');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

main();
