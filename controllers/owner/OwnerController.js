import mongoose from "mongoose";
import { Owner } from "../../models/OwnerModel.js";
import { RentalStores } from "../../models/RentalStores.js";
import User from "../../models/UserModel.js";
import { convertToISO, isValidDate } from "../../utils/helper.js";

export const postStoreForRentHandler = async (req, res) => {

    let {

        square_feet,
        description,
        specification,
        rate,
        advance_amt,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        available_from,
        available_to,
        comment,
        keywords,
        images

    } = req.body;

    try {
        if (!square_feet || !description || !specification || !rate || !advance_amt || !address_line1 || !address_line2 || !city || !state || !pincode || !available_from || !available_to || !keywords) {
            return res.status(400).json({
                status: "Error",
                message: "Invalid Request!",
                data: {
                    error: "Missing required fields 'square_feet', 'description', 'specification', 'rate', 'advance_amt', 'address_line1', 'address_line2', 'city', 'state', 'pincode', 'available_from', 'available_to', 'keywords'"
                }
            })
        }

        const user = await User.findOne({ _id: req.user._id });
        if (!user) {
            return res.status(404).json({
                status: "Error",
                message: "User not found!",
                data: {
                    error: `User with id ${req.user._id} not found!`
                }
            })
        }

        const ownerRequest = await Owner.findOne({ user_id: req.user._id });

        if (!ownerRequest || ownerRequest.is_approved !== 1) {
            return res.status(400).json({
                status: "Error",
                message: "Invalid Request!",
                data: {
                    error: "User is not an owner. To post the store you should be an approved owner!"
                }
            })
        }


        const newStoreForRent = new RentalStores({
            square_feet,
            description,
            specification,
            rate,
            advance_amt,
            address_line1,
            address_line2,
            city,
            state,
            pincode,
            available_from: isValidDate(available_from) ? convertToISO(available_from) : available_from,
            available_to: isValidDate(available_to) ? convertToISO(available_to) : available_to,
            comment,
            keywords,
            images,
            user_id: req.user._id
        });

        const newStore = await newStoreForRent.save();
        res.status(201).json({
            status: "Success",
            message: "Store posted successfully!",
            data: {
                store: newStore
            }
        })
    }


    catch (err) {
        return res.status(500).json({
            status: "Error",
            message: "Internal Server Error!",
            data: {
                error: err.message
            }
        })
    }
}

export const getStoreByUserIdHandler = async (req, res) => {

    const id = req.user._id;

    try {
        const store = await RentalStores.find({ user_id: id }).populate('bookings');
        if (!store) {
            return res.status(404).json({
                status: "Error",
                message: "Store not found!",
                data: {
                    error: `Store with id ${id} not found!`
                }
            })
        }
        res.status(200).json({
            status: "Success",
            message: "Store retrieved successfully!",
            data: {
                store: store
            }
        })
    }
    catch (err) {
        return res.status(500).json({
            status: "Error",
            message: "Internal Server Error!",
            data: {
                error: err.message
            }
        })
    }
}


export const updateStoreByIdHandler = async (req, res) => {
    const id = new mongoose.Types.ObjectId(req.params.id);

    let {
        square_feet,
        description,
        specification,
        rate,
        advance_amt,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        available_from,
        available_to,
        comment,
        keywords,
        images
    } = req.body;

    try {
        if (!square_feet || !description || !specification || !rate || !advance_amt || !address_line1 || !address_line2 || !city || !state || !pincode || !available_from || !available_to || !keywords) {
            return res.status(400).json({
                status: "Error",
                message: "Invalid Request!",
                data: {
                    error: "Missing required fields 'square_feet', 'description','specification', 'rate', 'advance_amt', 'address_line1', 'address_line2', 'city','state', 'pincode', 'available_from', 'available_to', 'keywords'"
                }
            })
        }
        const user = await User.findOne({ _id: req.user._id });
        if (!user) {
            return res.status(404).json({
                status: "Error",
                message: "User not found!",
                data: {
                    error: `User with id ${req.user._id} not found!`
                }
            })
        }
        const store = await RentalStores.findOne({ _id: id });
        if (!store) {
            return res.status(404).json({
                status: "Error",
                message: "Store not found!",
                data: {
                    error: `Store with id ${id} not found!`
                }
            })
        }

        if (store.user_id.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                status: "Error",
                message: "Invalid Request!",
                data: {
                    error: "You are not the owner of this store!"
                }
            })
        }
        const updatedStore = await RentalStores.findByIdAndUpdate(id, {
            square_feet,
            description,
            specification,
            rate,
            advance_amt,
            address_line1,
            address_line2,
            city,
            state,
            pincode,
            available_from: isValidDate(available_from) ? convertToISO(available_from) : available_from,
            available_to: isValidDate(available_to) ? convertToISO(available_to) : available_to,
            keywords,
            comment,
            images,
            user_id: req.user._id
        }, { new: true, upsert: true })

        res.status(200).json({
            status: "Success",
            message: "Store updated successfully!",
            data: {
                store: updatedStore
            }
        })

    }

    catch (err) {
        return res.status(500).json({
            status: "Error",
            message: "Internal Server Error!",
            data: {
                error: err.message
            }
        })
    }
}


export const deleteStoreByIdHandler = async (req, res) => {
    const id = new mongoose.Types.ObjectId(req.params.id);

    try {
        const user = await User.findOne({ _id: req.user._id });
        if (!user) {
            return res.status(404).json({
                status: "Error",
                message: "User not found!",
                data: {
                    error: `User with id ${req.user._id} not found!`
                }
            })
        }
        const store = await RentalStores.findOne({ _id: id });
        if (!store) {
            return res.status(404).json({
                status: "Error",
                message: "Store not found!",
                data: {
                    error: `Store with id ${id} not found!`
                }
            })
        }
        if (store.user_id.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                status: "Error",
                message: "Invalid Request!",
                data: {
                    error: "You are not the owner of this store!"
                }
            })
        }

        const deletedStore = await RentalStores.findByIdAndDelete(id);
        res.status(200).json({
            status: "Success",
            message: "Store deleted successfully!",
            data: {
                store: deletedStore
            }
        })
    }
    catch (err) {
        return res.status(500).json({
            status: "Error",
            message: "Internal Server Error!",
            data: {
                error: err.message
            }
        })
    }
}


export const getStoreByIdHandler = async (req, res) => {
    const id = new mongoose.Types.ObjectId(req.params.id);

    try {
        const store = await RentalStores.findOne({ _id: id }).populate('bookings').populate({
            path: 'bookings',
            populate: {
                path: 'user_id',
                model: 'User'
            }
        }).populate('user_id');
        if (!store) {
            return res.status(404).json({
                status: "Error",
                message: "Store not found!",
                data: {
                    error: `Store with id ${id} not found!`
                }
            })
        }
        res.status(200).json({
            status: "Success",
            message: "Store retrieved successfully!",
            data: {
                store: store
            }
        })
    }
    catch (err) {
        return res.status(500).json({
            status: "Error",
            message: "Internal Server Error!",
            data: {
                error: err.message
            }
        })
    }
}

