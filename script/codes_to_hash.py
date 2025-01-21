import csv

# Replace 'airlines.csv' with the path to your CSV file
input_csv = 'L_UNIQUE_CARRIERS.csv'
output_js = 'airlineCodes.js'

# Open and read the CSV file
with open(input_csv, 'r') as csvfile:
    reader = csv.DictReader(csvfile)
    
    # Create the JavaScript object as a dictionary
    airlines = {}
    for row in reader:
        code = row['Code']
        description = row['Description']
        airlines[code] = description

# Format the dictionary into a JavaScript export string
js_content = "export const airlineCodes = {\n"
for code, description in airlines.items():
    js_content += f'  "{code}": "{description}",\n'
js_content = js_content.rstrip(',\n') + "\n};\n"

# Write the output to a JS file
with open(output_js, 'w') as jsfile:
    jsfile.write(js_content)

print(f"JavaScript file '{output_js}' has been created.")
