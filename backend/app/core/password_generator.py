import secrets
import string

# Characters sets
UPPERCASE = string.ascii_uppercase
LOWERCASE = string.ascii_lowercase
DIGITS = string.digits
ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS


def generate_random_password(length: int = 6) -> str:
    """
    Generates a secure random password containing a mix of
    uppercase letters, lowercase letters, numbers, and symbols.
    Ensures at least one character from each set if length >= 4.
    """
    if length < 4:
        length = 6

    # Ensure at least one from each category
    password_chars = [
        secrets.choice(UPPERCASE),
        secrets.choice(LOWERCASE),
        secrets.choice(DIGITS),
    ]

    # Fill remaining characters randomly from all sets
    for _ in range(length - len(password_chars)):
        password_chars.append(secrets.choice(ALL_CHARS))

    # Shuffle characters using secrets
    shuffled = password_chars[:]
    for i in range(len(shuffled) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        shuffled[i], shuffled[j] = shuffled[j], shuffled[i]

    return "".join(shuffled)
