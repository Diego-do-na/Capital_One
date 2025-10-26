# 🪞 Mirror Savings — Capital One Hackathon Project

Mirror Savings es una aplicación web inteligente que transforma los gastos diarios en oportunidades automáticas de ahorro.  
Su principio es simple: **cada vez que gastas, el sistema refleja tu compra con un ahorro equivalente**, aplicando lo que llamamos una *transferencia espejo*.  
El resultado es una herramienta que fomenta hábitos financieros saludables de manera automática y sin fricción.

El proyecto fue desarrollado para el **Hackathon de Capital One (HackMTY 2025)**, integrando tres pilares tecnológicos:  
un **frontend en React**, un **backend en Node.js/Express**, y un **servicio de Machine Learning en Python/FastAPI**, conectados a una base de datos **MongoDB**.

---

Mirror Savings aprovecha la inteligencia artificial para analizar cada transacción que el usuario registra.  
Cuando la IA detecta que se trata de un gasto susceptible de ahorro —también llamado “gasto hormiga”— el sistema genera una **transferencia espejo**, moviendo automáticamente el mismo monto hacia una cuenta de ahorro.  
Así, los usuarios duplican el impacto de sus compras al transformar cada gasto en una inversión personal.

El sistema no busca reemplazar los hábitos financieros, sino **potenciarlos**: pequeñas decisiones repetidas consistentemente se reflejan en grandes resultados a largo plazo.

---

### 🔍 Arquitectura y Componentes

Mirror Savings está construido bajo una arquitectura modular basada en microservicios, permitiendo escalabilidad y mantenimiento independiente de cada parte.

- **Frontend (React):**  
  Es la interfaz visual con la que el usuario interactúa. Permite ingresar transacciones, visualizar el saldo disponible, el ahorro acumulado y revisar el historial de gastos.  
  Utiliza Axios para comunicarse con la API del backend y maneja actualizaciones en tiempo real del estado financiero del usuario.

- **Backend (Node.js + Express):**  
  Actúa como intermediario entre el frontend, la base de datos y el servicio de Machine Learning.  
  Gestiona la lógica de negocio, valida las transacciones, controla los saldos y determina cuándo aplicar una transferencia espejo.  
  Incluye controladores y rutas REST, conexión segura con MongoDB y comunicación directa con el microservicio de ML vía HTTP.

- **ML Service (Python + FastAPI):**  
  Es un microservicio encargado de clasificar transacciones.  
  Usa un modelo entrenado con **scikit-learn** (GaussianNB) que predice si un gasto debe ser considerado “reflejado” (aplica ahorro) o “normal” (sin ahorro).  
  Responde al backend con una predicción en tiempo real, devolviendo un valor binario (`1` o `0`) y una confianza estimada.  
  El modelo y el preprocesador se almacenan en archivos `.pkl` para una carga rápida en cada ejecución.

- **Base de datos (MongoDB):**  
  Se encarga de la persistencia de datos.  
  Contiene dos colecciones principales:
  - **Customers:** almacena los datos del usuario, como saldo disponible y total ahorrado.
  - **Transactions:** registra cada gasto procesado, incluyendo categoría, establecimiento, monto, si fue ahorro o no, y mensajes de validación.

- **API bancaria simulada:**  
  En el contexto del hackathon se emplea una API mock inspirada en la **Nessie API de Capital One**, que simula operaciones bancarias, transferencias y validaciones de saldo.

---

### ⚙️ Dependencias del Sistema

Mirror Savings integra tecnologías modernas y ligeras que facilitan la interoperabilidad entre lenguajes y servicios.

**Frontend:**
- React (interfaz de usuario)
- React Router DOM (navegación entre vistas)
- Axios (comunicación con el backend)
- Bootstrap o Tailwind (estilos)
- Dotenv (variables de entorno locales)

**Backend:**
- Node.js + Express (servidor REST)
- Mongoose (ORM para MongoDB)
- Axios (comunicación con el servicio ML)
- CORS (seguridad entre dominios)
- Dotenv (configuración)
- Nodemon (desarrollo en caliente)
- Morgan (registro de peticiones)

**ML Service:**
- Python 3.9+  
- FastAPI (API para predicción)
- Uvicorn (servidor ASGI)
- Scikit-learn (entrenamiento y modelo)
- Pandas / Numpy (procesamiento de datos)
- Joblib (serialización de modelo)
- Pydantic (validación de inputs)

**Base de Datos:**
- MongoDB (>=4.4)
- Conexión mediante `mongoose` en el backend
- Configuración en `.env`:  
  `MONGO_URI=mongodb://localhost:27017/mirror_savings`

---

### 🔄 Flujo de Operación

1. El usuario abre la aplicación web y observa su saldo y ahorro actual.  
2. Ingresa un nuevo gasto especificando monto, categoría y establecimiento.  
3. El backend envía los datos al servicio de Machine Learning para clasificar la transacción.  
4. Si el ML determina que es un gasto “reflejado”, el sistema:
   - Duplica el monto (aplica la transferencia espejo)
   - Descuenta el total del saldo normal
   - Suma el monto duplicado al ahorro total
5. Se registra la transacción en la base de datos y se actualiza la interfaz del usuario.  
6. El usuario puede consultar en cualquier momento su historial de transacciones, incluyendo las que generaron ahorro y las que no.

Este flujo ocurre en tiempo real, manteniendo sincronizados los valores de saldo y ahorro con cada operación.

---

### 🧠 Modelo de Machine Learning

El modelo fue desarrollado y entrenado con **scikit-learn** utilizando el algoritmo **Gaussian Naive Bayes**, seleccionado por su eficiencia y rapidez para clasificación binaria.  
El entrenamiento se realiza en el script `train_model.py`, que procesa datos de ejemplo y genera dos archivos:
- `mirror_savings_model.pkl` — modelo entrenado.
- `mirror_savings_preprocessor.pkl` — codificador de categorías.

El servicio ML expone un endpoint `/predict`, que recibe una transacción con los campos:
```json
{
  "monto": 25.50,
  "categoria": "Comida",
  "establecimiento": "Cafetería Central"
}
