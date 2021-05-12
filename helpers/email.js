const Mailgun = require("mailgun-js");
const Template = require("../model/template");
const mailgun = new Mailgun ({
    apiKey:process.env.MAILGUN_API_KEY,
    domain:process.env.MAILGUN_DOMAIN,
})

const emailInternalHelper = {};
const emailHelper={}

// const sendTestEmail = () => {
//     const data={
//         from:"socialblog@nhatlam.vn",
//         to:"nnhatlam1112@gmail.com",
//         subject:"HELOOOOOOOOO WORLD AGAIN??? ",
//         html:`hi <strong>THIS IS LAM</strong> this is my first test`
//     }
//     mailgun.messages().send(data,function(err,body){
//         if(err){
//             console.log(err)
//         }
//         console.log(body)
//     })
// }

emailInternalHelper.createTemplatesIfNotExists = async () =>{
 try {
    let template = await Template.findOne({ template_key: "verify_email" });
    if (!template){
        let emailTemplate = new Template({
            name: "Verify Email Template",
            description: "This template is used when user register a new email",
            template_key: "verify_email",
            from: "socialblog@nhatlam.vn",
            subject: "Hi %name%, welcome to CoderSchool!",
            html:`Hi <strong>%name%</strong> ,
            <br />
            Thank you for your registration.
            <br />
            Please confirm your email address by clicking on the link below.
            <br />
            %code%
            <br />
            If you face any difficulty during the sign-up, do get in
            touch with our Support team: apply@nhatlam.vn
            <br /> <br /> Always be learning!
            <br /> CoderSchool Team`,
            variables: ["name", "code"]
        })
        await emailTemplate.save()
    }
 } catch (err) {
    console.log(err.message);   
 }
}

emailHelper.renderEmailTemplate = async (template_key,variablesObj,toEmail)=>{
    try {
        //1 template is exist in templateSchema ?
        const template = await Template.findOne({template_key });
        if(!template){
            return {error:"Invalid Template Key"}
        }
        //2 make data
        const data = {
            from: template.from,
            to: toEmail,
            subject: template.subject,
            html: template.html,
          };
        //3 dynamic variables to given variables
        for(let i=0; i<template.variables.length;i++){
            let key = template.variables[i] // name
            console.log("this is key",key)
            console.log("this is variablesObj[key]",variablesObj[key])
            // console.log("this is doc",variablesObj.key)
            if(!variablesObj[key]){
                return {error:`Invalid variable key: missing ${key}`}
            }
            let re = new RegExp(`%${key}%`, "g"); // find all matches rather than stopping after the first match
            data.subject = data.subject.replace(re, variablesObj[key]);
            data.html = data.html.replace(re, variablesObj[key]);
        }
        //4 return data
        return data
    } catch (err) {
        console.log(err.message)
        return {error: err.message}
    }
}

emailHelper.send = (data)=>{
    mailgun.messages().send(data, function (error, info) {
        if (error) {
          console.log(error);
        }
        console.log(info);
      });
}

module.exports={emailInternalHelper,emailHelper}