# Cómo publicar y actualizar posts

Esta guía es documentación del repositorio y no se publica en la web. Los artículos del blog se escriben en inglés, en archivos Markdown dentro de `src/content/blog/`.

## 1. Crear el archivo

Abre el proyecto y crea, por ejemplo:

```text
src/content/blog/docker-basics.md
```

Usa nombres cortos, en minúsculas, sin espacios y separados por guiones. El nombre define la dirección del artículo: `/blog/docker-basics/`.

## 2. Escribir el post

Copia esta plantilla en el archivo y reemplaza el contenido:

````markdown
---
title: "Docker Basics"
description: "Commands I use to inspect containers and troubleshoot services."
tags: ["Docker", "Infrastructure"]
draft: false
---

Short context: what this note helps solve and when I use it.

## List running containers

```bash
docker ps
```

Use this command to check which containers are running.

## Read container logs

```bash
docker logs container-name
```

Replace `container-name` with the name of your container.

## References

- [Docker documentation](https://docs.docker.com/)
````

El bloque inicial entre `---` se llama frontmatter y contiene los datos del artículo:

| Campo | Uso |
| --- | --- |
| `title` | Título visible del artículo. Es obligatorio. |
| `description` | Resumen para el listado, buscador y metadatos. Es obligatorio. |
| `tags` | Temas para el filtro del blog. Reutiliza los nombres existentes cuando corresponda. |
| `draft` | `false` publica el artículo; `true` lo excluye del blog, buscador y páginas generadas. |
| `updated` | Opcional. Fecha de la última revisión real, con formato `AAAA-MM-DD`. Se muestra dentro del artículo. |

No es necesario agregar un título `#` al cuerpo: la página ya muestra el `title`. Usa encabezados `##` para las secciones que aparecerán automáticamente en el índice lateral y `###` para subsecciones.

El blog actual no programa publicaciones por fecha ni tiene un campo de fecha de publicación. `updated` es informativo: no cambia el orden del listado.

## 3. Revisar localmente

Desde la raíz del proyecto, inicia el servidor:

```bash
npm run dev
```

Abre la dirección que muestre la terminal, normalmente `http://localhost:4321`, y visita `/blog/docker-basics/`.

Si es la primera vez que trabajas en una copia del proyecto, instala las dependencias antes con `npm ci`. El proyecto usa actualmente npm y requiere Node.js 22.12 o superior.

Comprueba que:

- El texto y los comandos estén completos.
- Los encabezados aparezcan en el índice del artículo.
- Los enlaces funcionen.
- El artículo aparezca en `/blog/` y se encuentre con el buscador.
- Los bloques de código se puedan leer en una pantalla pequeña.

Con `draft: true`, el artículo tampoco tiene página en el servidor local. Para revisarlo, cambia temporalmente a `false`; si aún no quieres publicarlo, vuelve a `true` antes de generar la versión que subirás.

El listado del blog se ordena por título. La página de inicio muestra hasta tres notas; no todos los posts nuevos aparecerán allí. No necesitas modificar el menú, el buscador ni las tarjetas para publicar.

## 4. Validar y generar la web

Cuando el artículo esté listo, deja `draft: false` y ejecuta:

```bash
npm run check
npm run build
```

Si algún comando falla, corrige el error antes de subir los cambios. El build genera el artículo en `dist/blog/docker-basics/index.html` y actualiza el listado y el buscador.

En este repositorio, **`dist/` también se guarda en Git**, por lo que debes regenerarlo cada vez que cambies el contenido o el diseño. Edita siempre el archivo de `src/`; una modificación manual en `dist/` se pierde al volver a compilar.

Puedes revisar el resultado compilado con:

```bash
npm run preview
```

Abre la dirección que indique la terminal. Para detener cualquiera de los servidores, pulsa `Ctrl+C`.

## 5. Hacer commit y push

Revisa primero lo que vas a subir:

```bash
git status --short
git diff -- src/content/blog/docker-basics.md
```

Si el archivo es nuevo, `git diff` no muestra todavía su contenido: revísalo en el editor. Agrega el post y el build, y comprueba el resumen del commit:

```bash
git add src/content/blog/docker-basics.md dist
git diff --cached --stat
```

Confirma que solo estén los cambios que quieras publicar. Después:

```bash
git commit -m "Add Docker basics note"
git push origin master
```

Reemplaza `docker-basics.md` por el nombre real del artículo. Si el build incluye otros cambios locales, también aparecerán en el resumen: revísalos antes del commit.

Si Netlify está conectado al repositorio y configurado para desplegar `master`, el push iniciará el deploy. Espera a que termine correctamente y revisa la dirección del nuevo artículo en la web publicada. Subir a GitHub no confirma por sí solo que el deploy haya terminado.

## Actualizar un artículo existente

1. Edita su archivo en `src/content/blog/`.
2. Si corresponde, agrega o actualiza `updated` con la fecha real de revisión:

   ```yaml
   updated: 2026-10-13
   ```

3. Revisa localmente y repite los pasos de validación, build, commit y push.

Conserva el nombre del archivo para mantener la misma URL. Cambiarlo cambia la dirección y requiere ocuparse de los enlaces antiguos.

## Añadir imágenes

Guárdalas, por ejemplo, en `public/blog/docker-basics/` y usa una ruta desde la raíz:

```markdown
![Container status in the terminal](/blog/docker-basics/container-status.webp)
```

Incluye texto alternativo útil y agrega también las imágenes originales al commit:

```bash
git add src/content/blog/docker-basics.md public/blog/docker-basics dist
```

Usa archivos pequeños y evita capturas con credenciales u otros datos que no quieras publicar.

## Retirar un post

Para dejarlo como borrador, cambia a `draft: true` y repite el build y la publicación. Su dirección dejará de estar disponible. Si ya compartiste ese enlace, considera mantener una explicación o una redirección antes de retirarlo.

