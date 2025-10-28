import {body, validationResult} from 'express-validator';


async function validate(req, res, next) {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }
    next();
}

export const registerUserValidationRules = [
    body('email').isEmail().withMessage("Invalid email Address!"),
    body('password').isLength({ min: 8}).withMessage("Password must be atleast 8 Character long"),
    body('fullName.firstName').notEmpty().withMessage("First Name is Required!"),
    body('fullName.lastName').notEmpty().withMessage("Last Name is Required!"),
    validate
]