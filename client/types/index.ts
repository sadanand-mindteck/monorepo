export type AccessTokenPayload = {
  id: number;
  email: string;
  role: UserRoleEnum;
  organizationId: number;
  iat?: number;
  exp?: number;
};

export type loginResponse = {
  token: string;
  requiresMFA: boolean;
  user: AccessTokenPayload;
};

export type UserRoleEnum = "admin" | "warehouse" | "operator";

export type ExaminationResponse = {
  id: string;
  name: string;
  examCode: string;
  examDate: string;
  totalCenters: number;
  totalJammersRequired: number;
  status: "draft" | "planning" | "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type ExaminationResponseWithPagination = {
  data: ExaminationResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type ExaminationInput = {
  name: string;
  examCode: string;
  examDate: string;
  status?: "draft" | "planning" | "active" | "completed" | "cancelled";
};
