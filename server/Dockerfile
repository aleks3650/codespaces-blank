# server/Dockerfile

FROM denoland/deno:latest
WORKDIR /app
EXPOSE 8000

COPY deno.json deno.lock main.ts map_collider.json ./
COPY src ./src

CMD ["deno", "task", "start"]