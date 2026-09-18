from pydantic import BaseModel, EmailStr, model_validator

class UsuarioCrear(BaseModel):
    nombre: str | None = None  # Opcional para el login, requerido para el registro
    email: EmailStr
    password: str
    confirmar_password: str | None = None  # <-- Nuevo campo temporal

    # Validador para asegurar que password y confirmar_password sean iguales al registrarse
    @model_validator(mode='after')
    def verificar_passwords_coincidan(self):
        # Si estamos en modo registro (viene confirmar_password), validamos
        if self.confirmar_password is not None:
            if self.password != self.confirmar_password:
                raise ValueError("Las contraseñas no coinciden")
        return self

class UsuarioRespuesta(BaseModel):
    id: int
    nombre: str | None
    email: str

    class Config:
        from_attributes = True