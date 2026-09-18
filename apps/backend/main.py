from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
import bcrypt
import jwt
from datetime import datetime, timedelta

import models
import schemas
from database import engine, get_db

# Configuración de JWT
SECRET_KEY = "clave-secreta-super-segura-cambiar-en-produccion"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Crea las tablas en la base de datos automáticamente al iniciar
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Login con JWT y Registro Completo")

# --- CONFIGURACIÓN CORS PARA EL FRONTEND ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- FUNCIONES DE ENCRIPTACIÓN CON BCRYPT DIRECTO ---
def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verificar_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

def crear_token_acceso(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- RUTAS ---

@app.post("/registro", response_model=schemas.UsuarioRespuesta)
def registrar_usuario(usuario: schemas.UsuarioCrear, db: Session = Depends(get_db)):
    # 1. Verificar si el email ya existe
    db_usuario = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # 2. Encriptar la contraseña
    hashed_pwd = get_password_hash(usuario.password)
    
    # 3. Crear el usuario en la BD guardando también el nombre
    nuevo_usuario = models.Usuario(
        nombre=usuario.nombre,
        email=usuario.email, 
        hashed_password=hashed_pwd
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario


@app.post("/login")
def login(usuario: schemas.UsuarioCrear, db: Session = Depends(get_db)):
    # 1. Buscar al usuario por email
    db_usuario = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    
    # 2. Verificar si existe y si la contraseña coincide
    if not db_usuario or not verificar_password(usuario.password, db_usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # 3. Crear token JWT con el email como identificador (sub)
    access_token = crear_token_acceso(data={"sub": db_usuario.email})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "mensaje": "¡Login exitoso!"
    }


# Ruta protegida de ejemplo que requiere el token JWT
@app.get("/me")
def obtener_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    # Opcional: Buscar el usuario en la BD para devolver sus datos reales (incluyendo el nombre)
    db_usuario = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {
        "id": db_usuario.id,
        "nombre": db_usuario.nombre,
        "email": db_usuario.email,
        "estado": "Sesión activa con JWT"
    }