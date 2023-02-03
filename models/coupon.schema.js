
const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Please provide a coupon code'],
            maxlength: [8,"Coupon  code should not be more than 8 characters",
      ],
        },
        discount: {
            type: Number,
            default: 0
        },
        active: {
            type: Boolean,
            default: true,
            
        },
    },
    { timestamps: true}
);

module.exports =  mongoose.model("Coupon", couponSchema);