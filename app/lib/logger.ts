import pino from "pino"; // eslint-disable-line


interface CustomLogMessage {
  object?: any; // eslint-disable-line
  message: string;
}


const Hidden = "[******]";


function maskObject(obj: any) {
  const fieldsToMask = [
    "id",
    "name",
    "email",
    "token",
    "refreshToken",
    "password",
    "tel",
  ];
  const maskedObj = { ...obj };

  fieldsToMask.forEach((field) => {
    if (field in maskedObj) {
      maskedObj[field] = Hidden;
    }
  });

  return maskedObj;
}


const logger = pino({
  serializers: {
   
    object: (obj) => maskObject(obj),
  },
  browser: {
    serialize: ["object"],
  },
});


function logMessage(logData: CustomLogMessage) {
  logger.info(logData);
}

export { logMessage };
