"""Avatars router for avatar management."""
from fastapi import APIRouter


router = APIRouter(tags=["Users"])


# Pre-defined avatar URLs
AVATAR_URLS = [
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Chihiro&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Totoro&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Ponyo&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Kiki&backgroundColor=ffd5dc",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Howl&backgroundColor=d4f4dd",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Sophie&backgroundColor=fff4e6",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Nausicaa&backgroundColor=e3f2fd",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Ashitaka&backgroundColor=f3e5f5",
]


@router.get("/avatars", response_model=list[str])
async def get_avatars():
    """Get available avatar URLs."""
    return AVATAR_URLS
