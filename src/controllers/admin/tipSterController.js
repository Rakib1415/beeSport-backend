const { validationResult } = require("express-validator");
const cloudinaryUpload = require("../../helpers/cloudinaryUpload");
const TipSter = require("../../models/TipSter");
const { transformErrorsToMap } = require("../../utils");

const createTipSter = async (req, res, next) => {
  const errors = validationResult(req);
  const errorMessages = transformErrorsToMap(errors.array());
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, errors: errorMessages });
  }
  try {
    if (req.file) {
      req.body.image = await cloudinaryUpload(req.file, "tipster");
    }
    const tipSter = await TipSter.create(req.body);
    return res.status(200).send({ status: true, message: "TipSter created successfully", tipSter });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const allTipSter = async (req, res, next) => {
  try {
    const tipSter = await TipSter.find({});
    return res.status(200).send({ status: true, message: "TipSter fetched successfully", tipSter });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const singleTipSter = async (req, res, next) => {
  try {
    const tipSter = await TipSter.findById(req.params.id);
    return res.status(200).send({ status: true, message: "TipSter fetched successfully", tipSter });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateTipSter = async (req, res, next) => {
  const errors = validationResult(req);
  const errorMessages = transformErrorsToMap(errors.array());

  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, errors: errorMessages });
  }
  try {
    if (req.file) {
      req.body.image = await cloudinaryUpload(req.file, "tipster");
    }
    // console.log(req.body);
    const tipSter = await TipSter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).send({ status: true, message: "TipSter updated successfully", tipSter });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteTipSter = async (req, res, next) => {
  try {
    const tipSter = await TipSter.findByIdAndDelete(req.params.id);
    return res.status(200).send({ status: true, message: "TipSter deleted successfully", tipSter });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { createTipSter, updateTipSter, allTipSter, singleTipSter, deleteTipSter };
