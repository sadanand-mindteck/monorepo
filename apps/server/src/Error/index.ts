export default class CustomError extends Error {
  code: number;

  constructor(message: string = "An error occurred", code: number = 400) {
      super(message);
      this.name = "CustomError";
      this.code = code;

      // Ensures the name property reflects the class name
      Object.setPrototypeOf(this, new.target.prototype);
  }
}