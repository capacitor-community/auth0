import BaseError from "../utils/baseError";

export default class AuthError extends BaseError {
  json: any;
  status: any;

  constructor(response: any) {
    const { status, json = {}, text } = response;
    const { error, error_description: description } = json;
    super(
      error || "a0.response.invalid",
      description || text || handleInvalidToken(response) || "unknown error"
    );
    this.json = json;
    this.status = status;
  }
}

const handleInvalidToken = (response: any) =>
  response?.headers?.map["www-authenticate"].match(/error="invalid_token"/g)
    ? "invalid_token"
    : null;
