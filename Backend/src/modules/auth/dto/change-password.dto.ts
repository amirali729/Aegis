export class ChangePasswordDto {
  constructor(
    public readonly oldPassword: string,
    public readonly newPassword: string,
    public readonly confirmPassword: string
  ) {}
}