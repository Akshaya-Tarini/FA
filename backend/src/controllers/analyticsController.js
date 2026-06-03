const Application = require('../models/Application');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');

exports.getPlacementAnalytics = async (req, res, next) => {
  try {
    const totalApplications = await Application.countDocuments();
    const shortlistedCount = await Application.countDocuments({ status: 'shortlisted' });
    const selectedCount = await Application.countDocuments({ status: 'selected' });
    const rejectedCount = await Application.countDocuments({ status: 'rejected' });
    
    res.json({
      success: true,
      data: {
        totalApplications,
        shortlistedCount,
        selectedCount,
        rejectedCount
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getDepartmentAnalytics = async (req, res, next) => {
  try {
    const departments = await Student.aggregate([
      {
        $group: {
          _id: "$department",
          totalStudents: { $sum: 1 },
          placedStudents: {
            $sum: { $cond: [{ $eq: ["$status", "placed"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          department: "$_id",
          totalStudents: 1,
          placedStudents: 1,
          placementPercentage: {
            $multiply: [{ $divide: ["$placedStudents", "$totalStudents"] }, 100]
          },
          _id: 0
        }
      }
    ]);
    
    res.json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
};

exports.getCompanyAnalytics = async (req, res, next) => {
  try {
    const companies = await Company.aggregate([
      {
        $lookup: {
          from: "drives",
          localField: "_id",
          foreignField: "company",
          as: "drives"
        }
      },
      {
        $lookup: {
          from: "applications",
          localField: "drives._id",
          foreignField: "drive",
          as: "applications"
        }
      },
      {
        $project: {
          name: 1,
          highestPackage: "$package",
          driveParticipationCount: { $size: "$drives" },
          selectedStudents: {
            $size: {
              $filter: {
                input: "$applications",
                as: "app",
                cond: { $eq: ["$$app.status", "selected"] }
              }
            }
          }
        }
      }
    ]);
    
    res.json({ success: true, data: companies });
  } catch (err) {
    next(err);
  }
};
