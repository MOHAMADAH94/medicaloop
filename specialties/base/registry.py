from dataclasses import dataclass, field


@dataclass
class SpecialtyModule:
    """Contract for pluggable specialty modules."""

    code: str
    name: str
    name_ar: str
    permissions: list[str] = field(default_factory=list)
    api_url_module: str = ""
    enabled: bool = True


class SpecialtyRegistry:
    """Central registry for specialty modules."""

    _modules: dict[str, SpecialtyModule] = {}

    @classmethod
    def register(cls, module: SpecialtyModule) -> None:
        cls._modules[module.code] = module

    @classmethod
    def get(cls, code: str) -> SpecialtyModule | None:
        return cls._modules.get(code)

    @classmethod
    def all(cls) -> list[SpecialtyModule]:
        return list(cls._modules.values())

    @classmethod
    def clear(cls) -> None:
        cls._modules.clear()
