export interface RequestWithBody<T> extends Express.Request {
    body: T;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface ResponseData<T> {
    success: boolean;
    data?: T;
    message?: string;
}