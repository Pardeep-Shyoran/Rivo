import {body, validationResult} from 'express-validator';


async function validate(req, res, next) {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }
    next();
}

export const registerUserValidationRules = [
    body('email').trim().isEmail().withMessage("Invalid email Address!"),
    body('password').trim().isLength({ min: 8}).withMessage("Password must be atleast 8 Character long"),
    body('fullName.firstName').trim().notEmpty().withMessage("First Name is Required!"),
    body('fullName.lastName').trim().notEmpty().withMessage("Last Name is Required!"),
    validate
]

export const loginUserValidationRules = [
    body('email').trim().isEmail().withMessage("Invalid email Address!"),
    body('password').trim().notEmpty().withMessage("Password is Required!"),
    validate
]