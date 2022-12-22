const Yup = require('yup');


const userSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('نام و نام خانوادگی الزامی می باشد')
    .min(6, 'نام کاربری نباید کمتر از شش کاراکتر باشد'),
  phoneNumber: Yup.string()
    .min(11, 'شماره موبایل اشتباه است توجه داشته باشید حتما با صفر شروع شود')
    .max(11, 'شماره موبایل اشتباه است توجه داشته باشید حتما با صفر شروع شود')
    .required('شماره موبایل الزامی می باشد'),
  nationalId: Yup.string()
    .min(10, 'کد ملی اشتباه است')
    .max(10, 'کد ملی اشتباه است')
    .required('کد ملی الزامی می باشد'),
  birthDate: Yup.string()
    .required('تاریخ تولد الزامی می باشد'),
  fatherName: Yup.string()
    .min(3, 'نام پدر حداقل سه کاراکتر می باشد')
    .max(12, 'نام پدر حداکثر دوازده کاراکتر می باشد')
    .required('کد ملی الزامی می باشد'),
  gender: Yup.string()
    .required('انتخاب جنسیت الزامی می باشد'),
  password: Yup.string()
    .min(4, 'کلمه عبور نباید کمتر از چهار کاراکتر باشد')
    .required('کلمه عبور الزامی می باشد'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'کلمه عبور باید تطابق داشته باشد')
});


const paymentSchema = Yup.object().shape({
  amount: Yup.number('مبلف باید عدد باشد')
    .required('مبلغ پرداختی الزامی می باشد'),
  phoneNumber: Yup.string()
    .min(11, 'شماره موبایل اشتباه است توجه داشته باشید حتما با صفر شروع شود')
    .max(11, 'شماره موبایل اشتباه است توجه داشته باشید حتما با صفر شروع شود')
    .required('شماره موبایل الزامی می باشد'),
  category: Yup.string()
    .required('دسته بندی پرداخت الزامی است'),
  nationalId: Yup.string()
    .min(10, 'کد ملی اشتباه است')
    .max(10, 'کد ملی اشتباه است')
    .required('کد ملی الزامی می باشد'),
  description: Yup.string()
    .required('توضیحات پرداخت پرداخت الزامی است'),

});

const agentSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('نام و نام خانوادگی الزامی می باشد')
    .min(6, 'نام کاربری نباید کمتر از شش کاراکتر باشد'),
  phoneNumber: Yup.string()
    .min(11, 'شماره موبایل اشتباه است توجه داشته باشید حتما با صفر شروع شود')
    .max(11, 'شماره موبایل اشتباه است توجه داشته باشید حتما با صفر شروع شود')
    .required('شماره موبایل الزامی می باشد'),
  nationalId: Yup.string()
    .min(10, 'کد ملی اشتباه است')
    .max(10, 'کد ملی اشتباه است')
    .required('کد ملی الزامی می باشد'),
  birthDate: Yup.string()
    .required('تاریخ تولد الزامی می باشد'),
  maritalStatus: Yup.boolean()
    .required('وضعیت تاهل الزامی می باشد'),
  skills: Yup.string()
    .required('مهارت ها الزامی می باشد'),
  landline: Yup.string()
    .required('شماره ثابت الزامی می باشد'),
  address: Yup.string()
    .required('آدرس الزامی می باشد'),
  lat: Yup.number()
    .required('مختصات جغرافیایی الزامی می باشد'),
  lng: Yup.number()
    .required('مختصات حغرافیایی الزامی می باشد'),
  fatherName: Yup.string()
    .min(3, 'نام پدر حداقل سه کاراکتر می باشد')
    .max(12, 'نام پدر حداکثر دوازده کاراکتر می باشد')
    .required('کد ملی الزامی می باشد'),
  gender: Yup.string()
    .required('انتخاب جنسیت الزامی می باشد'),
  password: Yup.string()
    .min(4, 'کلمه عبور نباید کمتر از چهار کاراکتر باشد')
    .required('کلمه عبور الزامی می باشد'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'کلمه عبور باید تطابق داشته باشد')
});
const cancellationSchema = Yup.object().shape({
  serviceCode: Yup.string()
    .required('شناسه سرویس الزامی می باشد'),
  reasons: Yup.string()
    .required('دلایل انصراف الزامی می باشد'),
  description: Yup.string()
});

module.exports = {
  userSchema,
  paymentSchema,
  agentSchema,
  cancellationSchema
}
