import { z } from "zod";

/**
 * 邮箱验证
 */
export const emailSchema = z.email({ message: "请输入正确的邮箱" }).nullable();

/**
 * 密码验证
 */
export const passwordSchema = z
  .string()
  .min(6, {
    message: "密码长度至少为6个字符",
  })
  .max(20, {
    message: "密码长度不能超过20个字符",
  })
  .regex(/^[a-zA-Z0-9!@#$%*_+\-.]*$/, {
    message: "密码只能包含字母、数字、._-+@$%*等字符",
  });

/**
 * 用户名验证
 */
export const nameSchema = z
  .string()
  .min(2, {
    message: "用户名长度至少为2个字符",
  })
  .max(20, {
    message: "用户名长度不能超过20个字符",
  });

/**
 * 年龄验证
 */
export const ageSchema = z
  .number()
  .min(0, {
    message: "请输入正确的年龄",
  })
  .max(150, {
    message: "请输入正确的年龄",
  })
  .nullable();

/**
 * 注册表单验证
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  age: ageSchema,
});

/**
 * 获取所有表单错误信息
 * @param errMessage
 */
export const getAllSchemaMessage = (errMessage: string): string[] => {
  const errors = JSON.parse(errMessage || "[]");

  return errors.map((err: { message: string }) => err.message);
};
