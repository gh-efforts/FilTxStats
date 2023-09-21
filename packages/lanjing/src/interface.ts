export interface IGet {
  url: string;
  query: Record<string, any>;
}

export interface IPost {
  url: string;
  data: Record<string, any>;
}

export interface IAuthInfo {
  bk_app_code: string;
  bk_app_secret: string;
  bk_username: string;
  bk_obj_id: string;
}

export interface ILanJingConfig extends IAuthInfo {
  url: string;
}
