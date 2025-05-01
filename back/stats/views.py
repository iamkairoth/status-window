from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import get_xata_client

CONSTANTS = {
    "name": "Akshat Pande",
    "weight": 77.15,
    "height": 180,
    "bmi": 25.1,
    "bfat": 24.7,
    "age": 29
}

# --- Calculation functions (unchanged) ---
def calculate_strength(row, constants):
    baselines = {
        "Bench Press (Kg)": constants["weight"],
        "BW PullUps (Rep)": 10,
        "BW PushUps (Rep)": 20,
        "Barbell Curl (Kg)": 0.5 * constants["weight"],
        "Shoulder Press (Kg)": 0.6 * constants["weight"],
        "BW Dips (Rep)": 10,
        "Squats (Kg)": 1.5 * constants["weight"],
        "Grip Strength": 50,
        "Leg Press": 2 * constants["weight"],
        "Dead Lift": 1.8 * constants["weight"],
        "Resting Heart Rate": 60,
        "BW Plank": 120,
    }
    metric = row.get("metric", "")
    value = row.get("value", 0) or 0
    baseline = baselines.get(metric, 0)
    height_adjustment = (constants["height"] - 175) * 0.001
    age_adjustment = (constants["age"] - 25) * 0.01
    bf_adjustment = (1 - (constants["bfat"] / 100)) * 0.1
    if metric == "Resting Heart Rate":
        return (baseline / value) * (1 - bf_adjustment) if value > 0 else 0
    return (
        (value / baseline)
        * (1 + height_adjustment)
        * (1 - age_adjustment)
        * (1 + bf_adjustment)
        if baseline > 0
        else 0
    )

def calculate_intelligence(row):
    value = row.get("value", 0) or 0
    weightage = row.get("weightage", 1) or 1
    return value * weightage

def calculate_resilience(row, constants):
    value = row.get("value", 0) or 0
    baseline = row.get("baseline", 1) or 1
    age_adjustment = (constants["age"] - 25) * 0.01
    metric = row.get("metric", "")
    if metric == "Stress Recovery Time (Minutes)":
        return (baseline / value) * (1 - age_adjustment) if value > 0 else 0
    return (value / baseline) * (1 - age_adjustment) if baseline > 0 else 0

def calculate_creativity(row):
    value = row.get("value", 0) or 0
    weightage = row.get("weightage", 1) or 1
    return value * weightage

def calculate_luck(row):
    return row.get("value", 0) or 0

def calculate_curiosity(row):
    return row.get("value", 0) or 0


def calculate_total_score(attribute, constants):
    client = get_xata_client()
    response = client.data().query(
        "attributes_log",
        {"filter": {"attribute": attribute.lower()}}
    )
    data = response.get("records", [])

    if not data:
        return 0, {"error": "No data found"}

    total = 0
    breakdown = {}
    for row in data:
        if attribute.lower() == "strength":
            score = calculate_strength(row, constants)
        elif attribute.lower() == "intelligence":
            score = calculate_intelligence(row)
        elif attribute.lower() == "resilience":
            score = calculate_resilience(row, constants)
        elif attribute.lower() == "creativity":
            score = calculate_creativity(row)
        elif attribute.lower() == "luck":
            score = calculate_luck(row)
        elif attribute.lower() == "curiosity":
            score = calculate_curiosity(row)
        else:
            return 0, {"error": "Invalid attribute"}
        total += score
        breakdown[row["metric"]] = score

    return round(total, 2), breakdown

# --- API Views ---

class StatusEffectsView(APIView):
    def get(self, request):
        try:
            client = get_xata_client()
            response = client.data().query("status_effects", {"filter": {}})
            return Response(response["records"])
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CampaignsView(APIView):
    def get(self, request):
        try:
            client = get_xata_client()
            response = client.data().query("campaigns", {"filter": {}})
            return Response(response["records"])
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExperienceView(APIView):
    def get(self, request):
        try:
            client = get_xata_client()
            response = client.data().query("experience_log", {"filter": {}})
            data = response.get("records", [])
            total_exp = sum(item["experience"] for item in data)

            def exp_for_level(lvl):
                return 100 * (lvl - 1)

            level = 1
            while total_exp >= exp_for_level(level + 1):
                level += 1

            current_exp = exp_for_level(level)
            next_exp = exp_for_level(level + 1)
            progress = round(((total_exp - current_exp) / (next_exp - current_exp)) * 100, 2)

            return Response({
                "current_level": level,
                "current_experience": total_exp,
                "current_level_exp": current_exp,
                "next_level_exp": next_exp,
                "progress_percentage": progress
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectsView(APIView):
    def get(self, request):
        try:
            client = get_xata_client()
            response = client.data().query("projects", {"filter": {}})
            return Response(response["records"])
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SkillsView(APIView):
    def get(self, request):
        try:
            client = get_xata_client()
            response = client.data().query("skills", {"filter": {}})
            return Response(response["records"])
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StatsView(APIView):
    def get(self, request, stat_name):
        try:
            total, breakdown = calculate_total_score(stat_name, CONSTANTS)
            return Response({
                "name": stat_name.capitalize(),
                "value": total,
                "breakdown": breakdown
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
