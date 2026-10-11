"""Gestational age calculations for OBGYN module."""

from datetime import date


class ObgynCalculationsService:
    @staticmethod
    def calculate_gestational_age(lmp: date, reference: date | None = None) -> tuple[int, int]:
        reference = reference or date.today()
        delta = reference - lmp
        weeks = delta.days // 7
        days = delta.days % 7
        return weeks, days

    @staticmethod
    def calculate_edd(lmp: date) -> date:
        from datetime import timedelta

        return lmp + timedelta(days=280)
