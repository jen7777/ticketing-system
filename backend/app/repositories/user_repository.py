from app.db.db import get_connection

class UserRepository:
    def _public_user(self, row):
        if not row:
            return None
        data = dict(row)
        data.pop("password_hash", None)
        return data

    def get_all(self):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users")
        data = [self._public_user(row) for row in cursor.fetchall()]

        conn.close()
        return data

    def get_by_id(self, user_id):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))
        data = cursor.fetchone()

        conn.close()
        return self._public_user(data)

    def get_by_email(self, email, include_password=False):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE lower(email)=lower(?)", (email,))
        data = cursor.fetchone()

        conn.close()
        if not data:
            return None
        return dict(data) if include_password else self._public_user(data)

    def create(self, data):
        conn = get_connection()
        cursor = conn.cursor()

        sql = "INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)"

        cursor.execute(sql, (
            data["name"],
            data["email"],
            data["role"],
            data.get("password_hash")
        ))

        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return user_id

    def update(self, user_id, data):
        conn = get_connection()
        cursor = conn.cursor()

        if data.get("password_hash"):
            sql = """
            UPDATE users
            SET name=?, email=?, role=?, password_hash=?
            WHERE id=?
            """

            cursor.execute(sql, (
                data["name"],
                data["email"],
                data["role"],
                data["password_hash"],
                user_id
            ))
        else:
            sql = """
            UPDATE users
            SET name=?, email=?, role=?
            WHERE id=?
            """

            cursor.execute(sql, (
                data["name"],
                data["email"],
                data["role"],
                user_id
            ))

        conn.commit()
        conn.close()

    def delete(self, user_id):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM users WHERE id=?", (user_id,))
        conn.commit()
        conn.close()
