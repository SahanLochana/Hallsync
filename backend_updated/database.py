from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite file — no server to install/configure. Good enough for a demo/capstone.
# Switch to MySQL later ONLY if you have time: e.g.
# SQLALCHEMY_DATABASE_URL = "mysql+pymysql://user:pass@localhost/faculty_db"
SQLALCHEMY_DATABASE_URL = "sqlite:///./faculty.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
