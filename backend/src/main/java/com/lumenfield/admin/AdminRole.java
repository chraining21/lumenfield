package com.lumenfield.admin;

/** 後台角色：ADMIN 可讀寫；VIEWER 只能看（公開 demo 帳號用），存檔、上傳一律 403。 */
public enum AdminRole {

	ADMIN, VIEWER

}
