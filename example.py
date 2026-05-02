import requests

API_URL = "https://roastmypage.vercel.app/api/v1/roast"

url = input("Enter a URL to roast: ").strip()

print(f"\nRoasting {url}...\n")

response = requests.post(API_URL, json={"url": url})

if not response.ok:
    print(f"Error {response.status_code}: {response.json().get('error')}")
    exit(1)

data = response.json()

print(f"Score:  {data['overallScore']}/100  ({data['grade']})")
print(f"Roast:  \"{data['roast']}\"")
print()
print("Breakdown:")
for cat in data["categories"]:
    bar = "█" * cat["score"] + "░" * (10 - cat["score"])
    print(f"  {cat['name']:<20} {bar}  {cat['score']}/10")
    print(f"  {'':20} {cat['feedback']}")
    print()
print("Top fixes:")
for i, fix in enumerate(data["fixes"], 1):
    print(f"  {i}. {fix}")
