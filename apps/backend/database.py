from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# URL de conexión a PostgreSQL
SQLALCHEMY_DATABASE_URL = "postgresql://admin:adminpassword@localhost:5432/logindb"

# Motor de conexión
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Sesión para interactuar con la BD
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para crear nuestros modelos (tablas)
Base = declarative_base()

# Función para inyectar la base de datos en las rutas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()