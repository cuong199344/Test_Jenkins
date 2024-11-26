// import mongoose from "mongoose";
// import Jobs from "../models/jobsModel.js";
// import Companies from "../models/companiesModel.js";
// import axios from "axios";
// const API_URL = "http://company-srv:8802/company/api-v1";

// const API = axios.create({
//   baseURL: API_URL,
//   responseType: "json",
// });

// const apiRequest = async ({ url, token, data, method }) => {
//   try {
//     const result = await API(url, {
//       method: method || "GET",
//       data: data,
//       headers: {
//         "content-type": "application/json",
//         Authorization: token ? `Bearer ${token}` : "",
//       },
//     });
//     console.log(result);
//     return result?.data;
//   } catch (error) {
//     const err = error.response.data;
//     console.log(err);
//     return { status: err.success, message: err.message };
//   }
// };

// export const createJob = async (req, res, next) => {
//   try {
//     const {
//       jobTitle,
//       jobType,
//       location,
//       salary,
//       vacancies,
//       experience,
//       desc,
//       requirements,
//     } = req.body;

//     if (
//       !jobTitle ||
//       !jobType ||
//       !location ||
//       !salary ||
//       !requirements ||
//       !desc
//     ) {
//       next("Please Provide All Required Fields");
//       return;
//     }

//     const id = req.body.user.userId;

//     if (!mongoose.Types.ObjectId.isValid(id))
//       return res.status(404).send(`No Company with id: ${id}`);

//     const jobPost = {
//       jobTitle,
//       jobType,
//       location,
//       salary,
//       vacancies,
//       experience,
//       detail: { desc, requirements },
//       company: id,
//     };

//     const job = new Jobs(jobPost);
//     await job.save();

//     const authHeader = req.headers["authorization"];
//     const token = authHeader.split(" ")[1];
    

    
//     const newData = {
//       id: id,
//       job: job._id,
//     };
//     const putRequest = await apiRequest({
//       url: "/companies/update-jobpost",
//       token: token,
//       data: newData,
//       method: "PUT",
//     });



//     res.status(200).json({
//       success: true,
//       message: "Job Posted SUccessfully",
//       job,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({ message: error.message });
//   }
// };

// export const updateJob = async (req, res, next) => {
//   try {
//     const {
//       jobTitle,
//       jobType,
//       location,
//       salary,
//       vacancies,
//       experience,
//       desc,
//       requirements,
//     } = req.body;
//     const { jobId } = req.params;

//     if (
//       !jobTitle ||
//       !jobType ||
//       !location ||
//       !salary ||
//       !desc ||
//       !requirements
//     ) {
//       next("Please Provide All Required Fields");
//       return;
//     }
//     const id = req.body.user.userId;

//     if (!mongoose.Types.ObjectId.isValid(id))
//       return res.status(404).send(`No Company with id: ${id}`);

//     const jobPost = {
//       jobTitle,
//       jobType,
//       location,
//       salary,
//       vacancies,
//       experience,
//       detail: { desc, requirements },
//       _id: jobId,
//     };

//     await Jobs.findByIdAndUpdate(jobId, jobPost, { new: true });

//     res.status(200).json({
//       success: true,
//       message: "Job Post Updated SUccessfully",
//       jobPost,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({ message: error.message });
//   }
// };

// export const getJobPosts = async (req, res, next) => {
//   try {
//     const { search, sort, location, jtype, exp } = req.query;
//     const types = jtype?.split(","); //full-time,part-time
//     const experience = exp?.split("-"); //2-6

//     let queryObject = {};

//     if (location) {
//       queryObject.location = { $regex: location, $options: "i" };
//     }

//     if (jtype) {
//       queryObject.jobType = { $in: types };
//     }

//     //    [2. 6]

//     if (exp) {
//       queryObject.experience = {
//         $gte: Number(experience[0]) - 1,
//         $lte: Number(experience[1]) + 1,
//       };
//     }

//     if (search) {
//       const searchQuery = {
//         $or: [
//           { jobTitle: { $regex: search, $options: "i" } },
//           { jobType: { $regex: search, $options: "i" } },
//         ],
//       };
//       queryObject = { ...queryObject, ...searchQuery };
//     }

//     let queryResult = Jobs.find(queryObject).populate({
//       path: "company",
//       select: "-password",
//     });

//     // SORTING
//     if (sort === "Newest") {
//       queryResult = queryResult.sort("-createdAt");
//     }
//     if (sort === "Oldest") {
//       queryResult = queryResult.sort("createdAt");
//     }
//     if (sort === "A-Z") {
//       queryResult = queryResult.sort("jobTitle");
//     }
//     if (sort === "Z-A") {
//       queryResult = queryResult.sort("-jobTitle");
//     }

//     // pagination
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 20;
//     const skip = (page - 1) * limit;

//     //records count
//     const totalJobs = await Jobs.countDocuments(queryResult);
//     const numOfPage = Math.ceil(totalJobs / limit);

//     queryResult = queryResult.limit(limit * page);

//     const jobs = await queryResult;

//     res.status(200).json({
//       success: true,
//       totalJobs,
//       data: jobs,
//       page,
//       numOfPage,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({ message: error.message });
//   }
// };

// export const getJobById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const job = await Jobs.findById({ _id: id }).populate({
//       path: "company",
//       select: "-password",
//     });

//     if (!job) {
//       return res.status(200).send({
//         message: "Job Post Not Found",
//         success: false,
//       });
//     }

//     //GET SIMILAR JOB POST
//     const searchQuery = {
//       $or: [
//         { jobTitle: { $regex: job?.jobTitle, $options: "i" } },
//         { jobType: { $regex: job?.jobType, $options: "i" } },
//       ],
//     };

//     let queryResult = Jobs.find(searchQuery)
//       .populate({
//         path: "company",
//         select: "-password",
//       })
//       .sort({ _id: -1 });

//     queryResult = queryResult.limit(6);
//     const similarJobs = await queryResult;

//     res.status(200).json({
//       success: true,
//       data: job,
//       similarJobs,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({ message: error.message });
//   }
// };

// export const deleteJobPost = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     await Jobs.findByIdAndDelete(id);

//     res.status(200).send({
//       success: true,
//       messsage: "Job Post Delted Successfully.",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({ message: error.message });
//   }
// };
import mongoose from "mongoose";
import Jobs from "../models/jobsModel.js";
import axios from "axios";
const API_URL = "http://company-srv:8802/company/api-v1";

const API = axios.create({
  baseURL: API_URL,
  responseType: "json",
});

const apiRequest = async ({ url, token, data, method }) => {
  try {
    const result = await API(url, {
      method: method || "GET",
      data: data,
      headers: {
        "content-type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return result?.data;
  } catch (error) {
    const err = error.response.data;
    console.log(err);
    return { status: err.success, message: err.message };
  }
};

export const createJob = async (req, res, next) => {
  try {
    const {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      experience,
      desc,
      requirements,
    } = req.body;

    if (
      !jobTitle ||
      !jobType ||
      !location ||
      !salary ||
      !requirements ||
      !desc
    ) {
      next("Please Provide All Required Fields");
      return;
    }

    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No Company with id: ${id}`);

    const jobPost = {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      experience,
      detail: { desc, requirements },
      company: id,
    };

    const job = new Jobs(jobPost);
    await job.save();

    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    
    const newData = {
      id: id,
      job: job._id,
    };
    const putRequest = await apiRequest({
      url: "/companies/update-jobpost",
      token: token,
      data: newData,
      method: "PUT",
    });

    res.status(200).json({
      success: true,
      message: "Job Posted SUccessfully",
      job,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      experience,
      desc,
      requirements,
    } = req.body;
    const { jobId } = req.params;

    if (
      !jobTitle ||
      !jobType ||
      !location ||
      !salary ||
      !desc ||
      !requirements
    ) {
      next("Please Provide All Required Fields");
      return;
    }
    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No Company with id: ${id}`);

    const jobPost = {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      experience,
      detail: { desc, requirements },
      _id: jobId,
    };

    await Jobs.findByIdAndUpdate(jobId, jobPost, { new: true });

    res.status(200).json({
      success: true,
      message: "Job Post Updated SUccessfully",
      jobPost,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getJobPosts = async (req, res, next) => {
  try {
    const { search, sort, location, jtype, exp } = req.query;
    const types = jtype?.split(","); //full-time,part-time
    const experience = exp?.split("-"); //2-6

    let queryObject = {};

    if (location) {
      queryObject.location = { $regex: location, $options: "i" };
    }

    if (jtype) {
      queryObject.jobType = { $in: types };
    }

    //    [2. 6]

    if (exp) {
      queryObject.experience = {
        $gte: Number(experience[0]) - 1,
        $lte: Number(experience[1]) + 1,
      };
    }

    if (search) {
      const searchQuery = {
        $or: [
          { jobTitle: { $regex: search, $options: "i" } },
          { jobType: { $regex: search, $options: "i" } },
        ],
      };
      queryObject = { ...queryObject, ...searchQuery };
    }


    let queryResult = Jobs.find(queryObject);


    // SORTING
    if (sort === "Newest") {
      queryResult = queryResult.sort("-createdAt");
    }
    if (sort === "Oldest") {
      queryResult = queryResult.sort("createdAt");
    }
    if (sort === "A-Z") {
      queryResult = queryResult.sort("jobTitle");
    }
    if (sort === "Z-A") {
      queryResult = queryResult.sort("-jobTitle");
    }

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    //records count
    const totalJobs = await Jobs.countDocuments(queryResult);
    const numOfPage = Math.ceil(totalJobs / limit);

    queryResult = queryResult.limit(limit * page);

    const jobs = await queryResult;

    const companyIds = jobs.map((job) => job.company);
    const companies = [];
    for (let i = 0; i < companyIds.length; i++) {
      const companyId = companyIds[i];
      const url = `/companies/get-company/${companyId}`;

      try {
        const company = await apiRequest({
          url: url,
          method: "GET",
        });

        companies.push(company.data || "null");
      } catch (error) {
        console.error(error);

      }
    }

    const companyMap = {};
    companies.forEach((company) => {
      companyMap[company._id] = company;
    });
    const jobsWithCompanyDetails = jobs.map(job => ({
      ...job._doc,
      company: companyMap[job.company],
    }));

    res.status(200).json({
      success: true,
      totalJobs,
      data: jobsWithCompanyDetails,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Jobs.findById({ _id: id });
    const companyId = job.company
    const company = await apiRequest({
      url: `/companies/get-company/${companyId}`,
      method: "GET",
    });
    const jobsWithCompanyDetails = {
      ...job._doc,
      company: company.data || "null",
    };

    if (!job) {
      return res.status(200).send({
        message: "Job Post Not Found",
        success: false,
      });
    }

    //GET SIMILAR JOB POST
    const searchQuery = {
      $or: [
        { jobTitle: { $regex: job?.jobTitle, $options: "i" } },
        { jobType: { $regex: job?.jobType, $options: "i" } },
      ],
    };

    

    // let queryResult = Jobs.find(searchQuery)
    //   .populate({
    //     path: "company",
    //     select: "-password",
    //   })
    //   .sort({ _id: -1 });

    let queryResult = Jobs.find(searchQuery)
      .sort({ _id: -1 });

    queryResult = queryResult.limit(6);
    const similarJobs = await queryResult;
    
    const companyIds = similarJobs.map((job) => job.company);
    const companies = [];
    for (let i = 0; i < companyIds.length; i++) {
      const companyId = companyIds[i];
      const url = `/companies/get-company/${companyId}`;

      try {
        // Gọi apiRequest cho từng companyId và đợi kết quả
        const company = await apiRequest({
          url: url,
          method: "GET",
        });

        // Push kết quả vào mảng companies
        companies.push(company.data || "null");
      } catch (error) {
        console.error(error);
      }
    }


    const companyMap = {};
    companies.forEach((company) => {
      companyMap[company._id] = company;
    });
    const similarJobsjobsWithCompanyDetails = similarJobs.map((job) => ({
      ...job._doc,
      company: companyMap[job.company],
    }));

    // res.status(200).json({
    //   success: true,
    //   data: jobs,
    //   similarJobs,
    // });
    res.status(200).json({
      success: true,
      data: jobsWithCompanyDetails,
      similarJobs,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const deleteJobPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Jobs.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      messsage: "Job Post Delted Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getJobPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Jobs.findById({ _id: id });


    if (!job) {
      return res.status(200).send({
        message: "Job Post Not Found",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
