import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import classification_report
from sklearn.compose import ColumnTransformer
import joblib
import os

DATA_FILE = 'datos_gastos.csv'
MODEL_PATH = 'gasto_hormiga_model.pkl'
PREPROCESSOR_PATH = 'gasto_hormiga_preprocessor.pkl'

COLUMNS_TO_USE = ['precio', 'categoria', 'tienda']
TARGET_COLUMN = 'es_hormiga'

if not os.path.exists(DATA_FILE):
    print(f"ERROR: No se encontró el archivo de datos: {DATA_FILE}")
    print("Por favor, asegúrate de que el CSV esté en la carpeta /ml_service/")
    exit()

print(f"Cargando datos desde {DATA_FILE}...")
df = pd.read_csv(DATA_FILE)

if not all(col in df.columns for col in COLUMNS_TO_USE + [TARGET_COLUMN]):
    print("ERROR: El CSV no contiene las columnas necesarias (precio, categoria, tienda, es_hormiga).")
    exit()

X = df[COLUMNS_TO_USE]
y = df[TARGET_COLUMN]

print("⚙️ Aplicando preprocesamiento y entrenamiento...")

numerical_features = ['precio']
categorical_features = ['categoria', 'tienda']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
    ],
    remainder='passthrough'
)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

X_train_processed = preprocessor.fit_transform(X_train)
X_test_processed = preprocessor.transform(X_test)

model = GaussianNB()
model.fit(X_train_processed, y_train)

y_pred = model.predict(X_test_processed)
print("\n--- Reporte de Clasificación ---")
print(classification_report(y_test, y_pred))

joblib.dump(model, MODEL_PATH)
joblib.dump(preprocessor, PREPROCESSOR_PATH)
print(f"Entrenamiento completo. Modelo guardado en {MODEL_PATH}")
